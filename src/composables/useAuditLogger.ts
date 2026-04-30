import { useAuditStore, type AuditResult } from '@/stores/audit'
import type { AuditModule } from '@/constants/auditModules'

export function useAuditLogger() {
  const audit = useAuditStore()

  const log = (module: AuditModule, result: AuditResult, detail?: Record<string, unknown>) => {
    audit.hydrate()
    audit.add({ module, result, detail })
  }

  return {
    logOk: (module: AuditModule, detail?: Record<string, unknown>) => log(module, 'OK', detail),
    logFail: (module: AuditModule, detail?: Record<string, unknown>) => log(module, 'FAIL', detail),
  }
}

