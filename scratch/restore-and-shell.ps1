# PowerShell Script to restore full src, fix security imports, and write empty shell modules for inactive domains

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$LEGACY_BACKEND = Join-Path $ROOT "VERDEVIA-BACKEND"

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

Write-Host "Restoring full src to all backends..." -ForegroundColor Cyan
$backends = @("VERDEVIA-MOBILE-BACKEND", "VERDEVIA-WEB-BACKEND", "VERDEVIA-CHATBOT-BACKEND", "VERDEVIA-ADMIN-BACKEND")

foreach ($app in $backends) {
  $targetSrc = Join-Path $ROOT "$app/src"
  if (Test-Path $targetSrc) {
    Remove-Item -Path "$targetSrc/*" -Recurse -Force | Out-Null
  }
  Ensure-Dir $targetSrc
  Copy-Item -Path (Join-Path $LEGACY_BACKEND "src/*") -Destination $targetSrc -Recurse -Force
}

# --- FIX SECURITY IMPORTS IN ALL BACKENDS ---
# Redirect event-publisher.port imports to app/common
foreach ($app in $backends) {
  $secDir = Join-Path $ROOT "$app/src/common/security"
  $files = @("activity-logger.interceptor.ts", "error-logger.filter.ts", "kafka-telemetry.interceptor.ts")
  foreach ($file in $files) {
    $filePath = Join-Path $secDir $file
    if (Test-Path $filePath) {
      Write-Host "Updating imports in $filePath..."
      $content = Get-Content -Path $filePath -Raw
      $content = $content -replace "import \{ EVENT_PUBLISHER_PORT, EventPublisherPort \} from '\.\./\.\./modules/messaging/ports/event-publisher.port';", "import { EVENT_PUBLISHER_PORT, EventPublisherPort } from 'app/common';"
      $content = $content -replace 'import \{ EVENT_PUBLISHER_PORT, EventPublisherPort \} from "\.\./\.\./modules/messaging/ports/event-publisher.port";', 'import { EVENT_PUBLISHER_PORT, EventPublisherPort } from "app/common";'
      $content = $content -replace "import \{ EventPublisherPort, EventPayload \} from '\.\./\.\./modules/messaging/ports/event-publisher.port';", "import { EventPublisherPort, EVENT_PUBLISHER_PORT } from 'app/common';"
      $content = $content -replace 'import \{ EventPublisherPort, EventPayload \} from "\.\./\.\./modules/messaging/ports/event-publisher.port";', 'import { EventPublisherPort, EVENT_PUBLISHER_PORT } from "app/common";'
      Set-Content -Path $filePath -Value $content -Force
    }
  }
}

# --- DEFINE HELPER TO CREATE SHELL MODULES ---
function Create-ShellModule($appPath, $moduleName, $entityImports, $entitiesArray) {
  $modDir = Join-Path $appPath "src/modules/$moduleName"
  Ensure-Dir $modDir
  $modFile = Join-Path $modDir "$moduleName.module.ts"
  
  $content = @"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
$entityImports

@Module({
  imports: [TypeOrmModule.forFeature([$entitiesArray])],
  exports: [TypeOrmModule],
})
export class $($moduleName.Substring(0,1).ToUpper() + $moduleName.Substring(1))Module {}
"@
  Set-Content -Path $modFile -Value $content -Force
  Write-Host "Created shell module at $modFile" -ForegroundColor Gray
}

# --- CONFIG VERDEVIA-MOBILE-BACKEND ---
Write-Host "Configuring VERDEVIA-MOBILE-BACKEND shells..." -ForegroundColor Yellow
$mobPath = Join-Path $ROOT "VERDEVIA-MOBILE-BACKEND"
# Inactive: forum, courses, stats
# Forum is Mongo-based (no TypeORM entities needed in shell)
Create-ShellModule $mobPath "forum" "" ""
Create-ShellModule $mobPath "courses" "import { Course } from './entities/course.entity';`nimport { CourseModule } from './entities/module.entity';`nimport { Lesson } from './entities/lesson.entity';`nimport { Quiz } from './entities/quiz.entity';" "Course, CourseModule, Lesson, Quiz"
Create-ShellModule $mobPath "stats" "import { AuditLog } from './entities/audit-log.entity';`nimport { SparkPrediction } from './entities/spark-prediction.entity';" "AuditLog, SparkPrediction"

# --- CONFIG VERDEVIA-WEB-BACKEND ---
Write-Host "Configuring VERDEVIA-WEB-BACKEND shells..." -ForegroundColor Yellow
$webPath = Join-Path $ROOT "VERDEVIA-WEB-BACKEND"
# Inactive: complaints, gamification, ai, messaging, stats
Create-ShellModule $webPath "complaints" "import { Complaint } from './entities/complaint.entity';" "Complaint"
Create-ShellModule $webPath "gamification" "import { Achievement } from './entities/achievement.entity';`nimport { UserGamification } from './entities/user-gamification.entity';" "Achievement, UserGamification"
Create-ShellModule $webPath "ai" "" ""
# Messaging is global, we can write a simple module shell
$webMsgFile = Join-Path $webPath "src/modules/messaging/messaging.module.ts"
$webMsgContent = @'
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EVENT_PUBLISHER_PORT } from 'app/common';
import { NoopEventPublisherAdapter } from './adapters/noop-event-publisher.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: NoopEventPublisherAdapter,
    },
  ],
  exports: [EVENT_PUBLISHER_PORT],
})
export class MessagingModule {}
'@
Set-Content -Path $webMsgFile -Value $webMsgContent -Force
Create-ShellModule $webPath "stats" "import { AuditLog } from './entities/audit-log.entity';`nimport { SparkPrediction } from './entities/spark-prediction.entity';" "AuditLog, SparkPrediction"

# --- CONFIG VERDEVIA-CHATBOT-BACKEND ---
Write-Host "Configuring VERDEVIA-CHATBOT-BACKEND shells..." -ForegroundColor Yellow
$chatbotPath = Join-Path $ROOT "VERDEVIA-CHATBOT-BACKEND"
# Inactive: complaints, gamification, stats, forum, courses, subscriptions, compliance, notifications, addresses, phones, messaging
Create-ShellModule $chatbotPath "complaints" "import { Complaint } from './entities/complaint.entity';" "Complaint"
Create-ShellModule $chatbotPath "gamification" "import { Achievement } from './entities/achievement.entity';`nimport { UserGamification } from './entities/user-gamification.entity';" "Achievement, UserGamification"
Create-ShellModule $chatbotPath "stats" "import { AuditLog } from './entities/audit-log.entity';`nimport { SparkPrediction } from './entities/spark-prediction.entity';" "AuditLog, SparkPrediction"
Create-ShellModule $chatbotPath "forum" "" ""
Create-ShellModule $chatbotPath "courses" "import { Course } from './entities/course.entity';`nimport { CourseModule } from './entities/module.entity';`nimport { Lesson } from './entities/lesson.entity';`nimport { Quiz } from './entities/quiz.entity';" "Course, CourseModule, Lesson, Quiz"
Create-ShellModule $chatbotPath "subscriptions" "import { Subscription } from './entities/subscription.entity';" "Subscription"
Create-ShellModule $chatbotPath "compliance" "import { Consent } from './entities/consent.entity';`nimport { ComplianceVersion } from './entities/compliance-version.entity';`nimport { PrivacyAudit } from './entities/privacy-audit.entity';" "Consent, ComplianceVersion, PrivacyAudit"
Create-ShellModule $chatbotPath "notifications" "" ""
Create-ShellModule $chatbotPath "addresses" "import { Address } from './entities/address.entity';" "Address"
Create-ShellModule $chatbotPath "phones" "import { Phone } from './entities/phone.entity';" "Phone"
# Messaging
$chatMsgFile = Join-Path $chatbotPath "src/modules/messaging/messaging.module.ts"
Set-Content -Path $chatMsgFile -Value $webMsgContent -Force

# --- CONFIG VERDEVIA-ADMIN-BACKEND ---
Write-Host "Configuring VERDEVIA-ADMIN-BACKEND shells..." -ForegroundColor Yellow
$adminPath = Join-Path $ROOT "VERDEVIA-ADMIN-BACKEND"
# Inactive: complaints, gamification, forum, courses, subscriptions, ai, notifications, addresses, phones, messaging
Create-ShellModule $adminPath "complaints" "import { Complaint } from './entities/complaint.entity';" "Complaint"
Create-ShellModule $adminPath "gamification" "import { Achievement } from './entities/achievement.entity';`nimport { UserGamification } from './entities/user-gamification.entity';" "Achievement, UserGamification"
Create-ShellModule $adminPath "forum" "" ""
Create-ShellModule $adminPath "courses" "import { Course } from './entities/course.entity';`nimport { CourseModule } from './entities/module.entity';`nimport { Lesson } from './entities/lesson.entity';`nimport { Quiz } from './entities/quiz.entity';" "Course, CourseModule, Lesson, Quiz"
Create-ShellModule $adminPath "subscriptions" "import { Subscription } from './entities/subscription.entity';" "Subscription"
Create-ShellModule $adminPath "ai" "" ""
Create-ShellModule $adminPath "notifications" "" ""
Create-ShellModule $adminPath "addresses" "import { Address } from './entities/address.entity';" "Address"
Create-ShellModule $adminPath "phones" "import { Phone } from './entities/phone.entity';" "Phone"
# Messaging
$adminMsgFile = Join-Path $adminPath "src/modules/messaging/messaging.module.ts"
Set-Content -Path $adminMsgFile -Value $webMsgContent -Force

Write-Host "PowerShell script completed successfully!" -ForegroundColor Green
