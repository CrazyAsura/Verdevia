# PowerShell Script to fix imports in extracted projects

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"

function Fix-MutationResultImport($file) {
  if (Test-Path $file) {
    Write-Host "Fixing MutationResultType import in $file..."
    $content = Get-Content -Path $file -Raw
    # Replace relative import with shared common import
    $content = $content -replace "import \{ MutationResultType \} from '\.\./\.\./forum/dto/graphql/forum-graphql.dto';", "import { MutationResultType } from 'app/common';"
    $content = $content -replace 'import \{ MutationResultType \} from "\.\./\.\./forum/dto/graphql/forum-graphql.dto";', 'import { MutationResultType } from "app/common";'
    Set-Content -Path $file -Value $content -Force
  }
}

# --- FIX MOBILE BACKEND ---
$mobBase = Join-Path $ROOT "VERDEVIA-MOBILE-BACKEND"
Fix-MutationResultImport (Join-Path $mobBase "src/modules/complaints/resolvers/complaints.resolver.ts")
Fix-MutationResultImport (Join-Path $mobBase "src/modules/compliance/resolvers/compliance.resolver.ts")
Fix-MutationResultImport (Join-Path $mobBase "src/modules/users/resolvers/users.resolver.ts")

# Update messaging.module.ts in mobile backend
$mobMsgModule = Join-Path $mobBase "src/modules/messaging/messaging.module.ts"
if (Test-Path $mobMsgModule) {
  Write-Host "Pruning messaging.module.ts in mobile backend..."
  $msgContent = @'
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EVENT_PUBLISHER_PORT } from 'app/common';
import { KafkaProducerAdapter } from './adapters/kafka-producer.adapter';
import { KafkaConsumerAdapter } from './adapters/kafka-consumer.adapter';
import { NoopEventPublisherAdapter } from './adapters/noop-event-publisher.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass:
        process.env.KAFKA_ENABLED === 'false'
          ? NoopEventPublisherAdapter
          : KafkaProducerAdapter,
    },
    KafkaConsumerAdapter,
  ],
  exports: [EVENT_PUBLISHER_PORT, KafkaConsumerAdapter],
})
export class MessagingModule {}
'@
  Set-Content -Path $mobMsgModule -Value $msgContent -Force
  # Delete consumers folder in mobile backend
  $consumersFolder = Join-Path $mobBase "src/modules/messaging/consumers"
  if (Test-Path $consumersFolder) {
    Remove-Item -Path $consumersFolder -Recurse -Force | Out-Null
  }
}


# --- FIX WEB BACKEND ---
$webBase = Join-Path $ROOT "VERDEVIA-WEB-BACKEND"
Fix-MutationResultImport (Join-Path $webBase "src/modules/users/resolvers/users.resolver.ts")
Fix-MutationResultImport (Join-Path $webBase "src/modules/courses/resolvers/courses.resolver.ts")
Fix-MutationResultImport (Join-Path $webBase "src/modules/compliance/resolvers/compliance.resolver.ts")


# --- FIX CHATBOT BACKEND ---
$chatbotBase = Join-Path $ROOT "VERDEVIA-CHATBOT-BACKEND"
Fix-MutationResultImport (Join-Path $chatbotBase "src/modules/users/resolvers/users.resolver.ts")
Fix-MutationResultImport (Join-Path $chatbotBase "src/modules/compliance/resolvers/compliance.resolver.ts")


# --- FIX ADMIN BACKEND ---
$adminBase = Join-Path $ROOT "VERDEVIA-ADMIN-BACKEND"
Fix-MutationResultImport (Join-Path $adminBase "src/modules/users/resolvers/users.resolver.ts")
Fix-MutationResultImport (Join-Path $adminBase "src/modules/compliance/resolvers/compliance.resolver.ts")

# Update messaging.module.ts in admin backend to import EVENT_PUBLISHER_PORT from app/common
$adminMsgModule = Join-Path $adminBase "src/modules/messaging/messaging.module.ts"
if (Test-Path $adminMsgModule) {
  Write-Host "Updating messaging.module.ts in admin backend..."
  $adminMsgContent = Get-Content -Path $adminMsgModule -Raw
  $adminMsgContent = $adminMsgContent -replace "import \{ EVENT_PUBLISHER_PORT \} from '\./ports/event-publisher.port';", "import { EVENT_PUBLISHER_PORT } from 'app/common';"
  $adminMsgContent = $adminMsgContent -replace 'import \{ EVENT_PUBLISHER_PORT \} from "\./ports/event-publisher.port";', 'import { EVENT_PUBLISHER_PORT } from "app/common";'
  # Delete port file in admin backend since it uses app/common
  Remove-Item -Path (Join-Path $adminBase "src/modules/messaging/ports/event-publisher.port.ts") -Force -ErrorAction SilentlyContinue
  Set-Content -Path $adminMsgModule -Value $adminMsgContent -Force
}

Write-Host "All imports fixed successfully!" -ForegroundColor Green
