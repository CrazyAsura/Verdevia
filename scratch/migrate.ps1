# PowerShell Migration Script to Extract Microservices to Root Workspace

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$LEGACY_BACKEND = Join-Path $ROOT "VERDEVIA-BACKEND"

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

Write-Host "Starting extraction of microservices to root level..." -ForegroundColor Cyan

# 1. Create and populate VERDEVIA-COMMON
$COMMON_PATH = Join-Path $ROOT "VERDEVIA-COMMON"
Ensure-Dir $COMMON_PATH
Copy-Item -Path (Join-Path $LEGACY_BACKEND "libs/common/src") -Destination (Join-Path $COMMON_PATH "src") -Recurse -Force

# Create tsconfig.json for common library
$commonTsconfig = @'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ESNext",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "skipLibCheck": true,
    "strict": false
  },
  "include": ["src/**/*"]
}
'@
Set-Content -Path (Join-Path $COMMON_PATH "tsconfig.json") -Value $commonTsconfig -Force

$commonPackage = @'
{
  "name": "verdevia-common",
  "version": "0.0.1",
  "private": true,
  "license": "UNLICENSED"
}
'@
Set-Content -Path (Join-Path $COMMON_PATH "package.json") -Value $commonPackage -Force

# 2. Extract each app
$apps = @(
  @{ name = "VERDEVIA-MOBILE-BACKEND"; srcName = "mobile-backend" },
  @{ name = "VERDEVIA-WEB-BACKEND"; srcName = "web-backend" },
  @{ name = "VERDEVIA-CHATBOT-BACKEND"; srcName = "chatbot-backend" },
  @{ name = "VERDEVIA-ADMIN-BACKEND"; srcName = "admin-backend" },
  @{ name = "VERDEVIA-MOBILE-GATEWAY"; srcName = "mobile-gateway" },
  @{ name = "VERDEVIA-WEB-GATEWAY"; srcName = "web-gateway" }
)

# Load base package.json dependencies
$legacyPkgRaw = Get-Content -Path (Join-Path $LEGACY_BACKEND "package.json") -Raw
$legacyPkg = ConvertFrom-Json $legacyPkgRaw

foreach ($app in $apps) {
  $targetPath = Join-Path $ROOT $app.name
  Ensure-Dir $targetPath

  Write-Host "Extracting $($app.name)..." -ForegroundColor Yellow

  # Copy src, test, and config files
  $appSrc = Join-Path $LEGACY_BACKEND "apps/$($app.srcName)/src"
  if (Test-Path $appSrc) {
    Copy-Item -Path $appSrc -Destination (Join-Path $targetPath "src") -Recurse -Force
  }

  $appTest = Join-Path $LEGACY_BACKEND "apps/$($app.srcName)/test"
  if (Test-Path $appTest) {
    Copy-Item -Path $appTest -Destination (Join-Path $targetPath "test") -Recurse -Force
  }

  # Copy .env and .env.example
  Copy-Item -Path (Join-Path $LEGACY_BACKEND ".env") -Destination (Join-Path $targetPath ".env") -Force
  Copy-Item -Path (Join-Path $LEGACY_BACKEND ".env.example") -Destination (Join-Path $targetPath ".env.example") -Force

  # Create nest-cli.json
  $nestCli = @'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "tsConfigPath": "tsconfig.json"
  }
}
'@
  Set-Content -Path (Join-Path $targetPath "nest-cli.json") -Value $nestCli -Force

  # Create tsconfig.json
  $tsconfig = @"
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ESNext",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "moduleResolution": "node",
    "paths": {
      "@/*": ["src/*"],
      "app/common": ["../VERDEVIA-COMMON/src"],
      "app/common/*": ["../VERDEVIA-COMMON/src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts", "src/database/seed.ts"]
}
"@
  Set-Content -Path (Join-Path $targetPath "tsconfig.json") -Value $tsconfig -Force

  # Create tsconfig.build.json
  $tsconfigBuild = @'
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
'@
  Set-Content -Path (Join-Path $targetPath "tsconfig.build.json") -Value $tsconfigBuild -Force

  # Create package.json using string interpolation of dependencies
  $depsJson = ConvertTo-Json $legacyPkg.dependencies -Depth 10
  $devDepsJson = ConvertTo-Json $legacyPkg.devDependencies -Depth 10

  $packageJsonStr = @"
{
  "name": "$($app.name.ToLower())",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": $depsJson,
  "devDependencies": $devDepsJson,
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^app/common(|/.*)$": "<rootDir>/../../VERDEVIA-COMMON/src/$1",
      "^@/(.*)$": "<rootDir>/$1"
    }
  }
}
"@
  Set-Content -Path (Join-Path $targetPath "package.json") -Value $packageJsonStr -Force
}

Write-Host "Migration script completed successfully." -ForegroundColor Green
