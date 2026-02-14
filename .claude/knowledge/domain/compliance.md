# Compliance Knowledge Base

## Overview

Guía práctica para implementar compliance en aplicaciones de software. Cubre las regulaciones más comunes y cómo implementarlas técnicamente.

---

## GDPR (General Data Protection Regulation)

### Scope
- Aplica a datos de ciudadanos de la EU
- Sin importar dónde esté la empresa
- Multas: hasta 4% de revenue global o €20M

### Principios Fundamentales

| Principio | Descripción | Implementación técnica |
|-----------|-------------|----------------------|
| **Lawfulness** | Base legal para procesar datos | Consent management, legitimate interest docs |
| **Purpose limitation** | Usar datos solo para propósito declarado | Data tagging, access controls |
| **Data minimization** | Solo recolectar lo necesario | Schema design, validation |
| **Accuracy** | Datos correctos y actualizados | Update mechanisms, user verification |
| **Storage limitation** | No retener más de lo necesario | Data retention policies, auto-delete |
| **Integrity & confidentiality** | Proteger datos | Encryption, access controls |
| **Accountability** | Poder demostrar compliance | Audit logs, documentation |

### Derechos del Usuario (Technical Implementation)

#### Right to Access (Art. 15)
```javascript
// API endpoint para data export
GET /api/user/data-export

// Response: All user data in portable format
{
  "user_profile": { ... },
  "activity_history": [ ... ],
  "preferences": { ... },
  "exported_at": "2024-01-15T10:30:00Z",
  "format": "JSON"
}
```

**Checklist:**
- [ ] Endpoint de export implementado
- [ ] Incluye TODOS los datos del usuario
- [ ] Formato portable (JSON, CSV)
- [ ] Response dentro de 30 días

#### Right to Erasure / Right to be Forgotten (Art. 17)
```javascript
// API endpoint para deletion
DELETE /api/user/me

// Proceso de borrado
1. Soft delete (mark as deleted)
2. Anonymize in analytics
3. Remove from backups (within retention period)
4. Notify third parties
5. Hard delete after grace period
```

**Checklist:**
- [ ] Proceso de borrado documentado
- [ ] Borrado de todos los sistemas
- [ ] Notificación a procesadores terceros
- [ ] Auditoría del borrado
- [ ] Excepciones documentadas (legal holds)

#### Right to Rectification (Art. 16)
```javascript
// Permitir edición de datos personales
PATCH /api/user/profile
{
  "name": "Corrected Name",
  "email": "correct@email.com"
}
```

#### Right to Data Portability (Art. 20)
```javascript
// Export en formato estándar
GET /api/user/data-export?format=json

// Formatos sugeridos
- JSON (structured data)
- CSV (tabular data)
- XML (legacy systems)
```

### Consent Management

**Consent Requirements:**
```javascript
// Consent record structure
{
  "user_id": "123",
  "consents": [
    {
      "purpose": "marketing_emails",
      "granted": true,
      "timestamp": "2024-01-15T10:30:00Z",
      "version": "privacy_policy_v2",
      "method": "explicit_checkbox",
      "ip_address": "192.168.1.1"
    }
  ]
}
```

**Implementation:**
- Granular consents (not bundled)
- Easy withdrawal mechanism
- Proof of consent stored
- Version tracking of policies

### Data Processing Agreement (DPA)

**Required with third parties:**
- Cloud providers (AWS, GCP, Azure)
- Analytics providers
- Email service providers
- Payment processors

**Technical verification:**
```javascript
// Verify third-party GDPR compliance
const verifyProcessor = async (vendor) => {
  return {
    hasDPA: await checkDPASigned(vendor),
    dataLocation: await getDataResidency(vendor),
    subProcessors: await listSubProcessors(vendor),
    securityCertifications: await getCertifications(vendor)
  };
};
```

### Breach Notification

**Timeline:**
- 72 hours to notify authority
- "Without undue delay" to affected users

**Technical implementation:**
```javascript
// Breach detection and notification system
const handleBreach = async (breach) => {
  // 1. Assess severity
  const severity = assessBreachSeverity(breach);

  // 2. Document
  await logBreachDetails(breach);

  // 3. Notify DPO
  await notifyDPO(breach);

  // 4. If high risk, notify authority
  if (severity === 'high') {
    await notifyAuthority(breach, { within: '72h' });
  }

  // 5. Notify affected users if needed
  if (requiresUserNotification(severity)) {
    await notifyAffectedUsers(breach);
  }
};
```

---

## PCI-DSS (Payment Card Industry Data Security Standard)

### Scope
- Aplica a cualquier entidad que procesa, almacena o transmite datos de tarjeta
- 12 requisitos principales
- 4 niveles según volumen de transacciones

### Los 12 Requisitos

| # | Requisito | Implementación |
|---|-----------|----------------|
| 1 | Firewall | Network segmentation |
| 2 | No vendor defaults | Change default passwords |
| 3 | Protect stored data | Encryption at rest |
| 4 | Encrypt transmission | TLS 1.2+ |
| 5 | Anti-malware | Endpoint protection |
| 6 | Secure development | SDLC security |
| 7 | Restrict access | Need-to-know basis |
| 8 | Authenticate users | Strong auth, MFA |
| 9 | Physical security | Facility controls |
| 10 | Monitor access | Logging, audit trails |
| 11 | Test regularly | Vulnerability scans, pentests |
| 12 | Security policies | Documentation |

### Scope Reduction (HIGHLY RECOMMENDED)

**Tokenization (reduce scope significantly):**
```javascript
// NUNCA almacenar datos de tarjeta
// Usar tokenización de payment provider

// MAL (in scope)
const processPayment = async (payment) => {
  const cardNumber = payment.cardNumber; // PCI scope!
  const cvv = payment.cvv; // NEVER store
  // Process...
};

// BIEN (out of scope)
const processPayment = async (tokenizedPayment) => {
  // Token from Stripe/PayPal/etc
  const paymentToken = tokenizedPayment.token;
  // Provider handles card data
  return stripe.charges.create({
    source: paymentToken,
    amount: tokenizedPayment.amount
  });
};
```

**iFrame Approach:**
```html
<!-- Card input in provider's iframe -->
<div id="card-element">
  <!-- Stripe/PayPal iframe renders here -->
  <!-- Card data never touches your servers -->
</div>
```

### Cardholder Data

**What requires protection:**
| Data | Storage allowed | Protection required |
|------|-----------------|---------------------|
| PAN (card number) | Yes | Encrypted or masked |
| Cardholder name | Yes | Encrypted if with PAN |
| Expiration | Yes | Encrypted if with PAN |
| CVV/CVC | **NEVER** | Never store |
| PIN | **NEVER** | Never store |
| Full magnetic stripe | **NEVER** | Never store |

**Masking:**
```javascript
// Only show first 6 and last 4
const maskPAN = (pan) => {
  return pan.slice(0, 6) + '******' + pan.slice(-4);
  // 4111111111111111 → 411111******1111
};
```

### Logging Requirements

```javascript
// PCI-compliant logging
const pciLog = (event) => {
  // NEVER log:
  // - Full PAN
  // - CVV
  // - PIN
  // - Full track data

  // DO log:
  // - User ID
  // - Action
  // - Timestamp
  // - IP address
  // - Resource accessed
  // - Success/failure

  logger.info({
    timestamp: new Date().toISOString(),
    user_id: event.userId,
    action: event.action,
    resource: event.resource,
    result: event.success ? 'success' : 'failure',
    ip: event.ipAddress,
    // Masked card if needed
    card_last_four: event.cardLastFour
  });
};
```

---

## HIPAA (Health Insurance Portability and Accountability Act)

### Scope
- Covered entities (healthcare providers, plans, clearinghouses)
- Business associates (anyone handling PHI for covered entities)
- PHI = Protected Health Information

### PHI Definition

**What is PHI:**
- Name + health condition
- Any of 18 identifiers + health data

**18 Identifiers:**
1. Names
2. Geographic data smaller than state
3. Dates (except year) related to individual
4. Phone numbers
5. Fax numbers
6. Email addresses
7. Social Security numbers
8. Medical record numbers
9. Health plan beneficiary numbers
10. Account numbers
11. Certificate/license numbers
12. Vehicle identifiers
13. Device identifiers
14. Web URLs
15. IP addresses
16. Biometric identifiers
17. Full-face photographs
18. Any other unique identifier

### Technical Safeguards (Required)

#### Access Controls
```javascript
// Role-based access to PHI
const accessControl = {
  roles: {
    'physician': ['read', 'write', 'prescribe'],
    'nurse': ['read', 'write'],
    'admin': ['read'],
    'billing': ['read:billing_only']
  },

  checkAccess: (user, resource, action) => {
    const userRole = user.role;
    const allowedActions = accessControl.roles[userRole];

    // Log every access attempt
    auditLog.record({
      user: user.id,
      resource: resource.id,
      action: action,
      allowed: allowedActions.includes(action),
      timestamp: Date.now()
    });

    return allowedActions.includes(action);
  }
};
```

#### Encryption Requirements
```javascript
// Encryption at rest (required)
// AES-256 for PHI storage
const encryptPHI = (data) => {
  return crypto.encrypt(data, {
    algorithm: 'aes-256-gcm',
    key: getKeyFromVault('phi-encryption-key')
  });
};

// Encryption in transit (required)
// TLS 1.2+ for all PHI transmission
// HTTPS only, no HTTP fallback
```

#### Audit Controls
```javascript
// All PHI access must be logged
const hipaaAuditLog = {
  record: async (event) => {
    await db.insert('audit_log', {
      timestamp: new Date().toISOString(),
      user_id: event.userId,
      patient_id: event.patientId,
      action: event.action, // 'view', 'create', 'modify', 'delete', 'export'
      resource_type: event.resourceType, // 'medical_record', 'prescription', etc
      resource_id: event.resourceId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      success: event.success,
      reason: event.reason // if viewing, why?
    });
  },

  // Logs must be retained 6 years
  retentionPeriod: '6 years'
};
```

#### Automatic Logoff
```javascript
// Session timeout required
const sessionConfig = {
  maxIdleTime: 15 * 60 * 1000, // 15 minutes
  warningBefore: 2 * 60 * 1000, // Warn 2 minutes before

  checkIdle: (session) => {
    const idleTime = Date.now() - session.lastActivity;
    if (idleTime > sessionConfig.maxIdleTime) {
      session.terminate();
      auditLog.record({ action: 'auto_logoff', reason: 'idle_timeout' });
    }
  }
};
```

### Business Associate Agreement (BAA)

**Required with all vendors handling PHI:**
- Cloud providers
- SaaS applications
- Consultants
- IT service providers

**BAA Checklist:**
- [ ] All vendors identified
- [ ] BAA signed with each
- [ ] Vendor security assessed
- [ ] Annual review scheduled

---

## SOC 2 (Service Organization Control 2)

### Trust Service Criteria

| Criteria | Description | Key controls |
|----------|-------------|--------------|
| **Security** | Protection against unauthorized access | Access controls, encryption, monitoring |
| **Availability** | System availability for operation | Uptime, disaster recovery, capacity |
| **Processing Integrity** | Complete, valid, timely processing | Input validation, error handling |
| **Confidentiality** | Protection of confidential info | Encryption, access restrictions |
| **Privacy** | Personal information handling | Privacy notices, consent, retention |

### Security Criteria Implementation

**CC6.1 - Logical Access:**
```javascript
// Access control implementation
const accessControl = {
  // Unique user identification
  authentication: {
    method: 'multi-factor',
    factors: ['password', 'totp'],
    sessionTimeout: 30 * 60 // 30 minutes
  },

  // Role-based authorization
  authorization: {
    model: 'RBAC',
    roles: ['admin', 'developer', 'viewer'],
    permissions: permissionMatrix
  },

  // Access reviews
  reviews: {
    frequency: 'quarterly',
    process: 'manager_approval',
    documented: true
  }
};
```

**CC6.6 - System Operations:**
```javascript
// Monitoring and logging
const monitoring = {
  logging: {
    events: ['auth', 'access', 'changes', 'errors'],
    retention: '1 year',
    immutable: true
  },

  alerting: {
    channels: ['pagerduty', 'email'],
    escalation: true,
    responseTime: '15 minutes'
  },

  review: {
    frequency: 'daily',
    automated: true,
    anomalyDetection: true
  }
};
```

### Audit Evidence

**What to maintain:**
- Change management records
- Access reviews
- Incident reports
- Training records
- Vendor assessments
- Policy versions

---

## Implementation Checklist by Regulation

### GDPR Checklist
- [ ] Data inventory completed
- [ ] Legal basis documented for each processing
- [ ] Privacy policy updated
- [ ] Consent mechanism implemented
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Breach notification process
- [ ] DPA with all processors
- [ ] Cookie consent (if applicable)
- [ ] DPO designated (if required)

### PCI-DSS Checklist
- [ ] Scope defined and minimized
- [ ] Card data tokenized (recommended)
- [ ] Encryption at rest
- [ ] TLS 1.2+ for transmission
- [ ] Access controls implemented
- [ ] Logging configured
- [ ] Vulnerability scans scheduled
- [ ] Penetration testing annual
- [ ] Security awareness training
- [ ] Incident response plan

### HIPAA Checklist
- [ ] PHI inventory completed
- [ ] Risk assessment performed
- [ ] Access controls implemented
- [ ] Encryption at rest and transit
- [ ] Audit logging configured
- [ ] Automatic logoff enabled
- [ ] BAAs with all associates
- [ ] Workforce training completed
- [ ] Incident response plan
- [ ] Disaster recovery plan

### SOC 2 Checklist
- [ ] Scope defined
- [ ] Controls documented
- [ ] Policies written
- [ ] Evidence collection automated
- [ ] Access reviews scheduled
- [ ] Change management process
- [ ] Incident management process
- [ ] Vendor management process
- [ ] Training program
- [ ] Continuous monitoring

---

## Common Technical Controls

### Encryption Standards

| Use Case | Algorithm | Key Size |
|----------|-----------|----------|
| Data at rest | AES-256-GCM | 256 bits |
| Data in transit | TLS 1.2+ | - |
| Password storage | Argon2id, bcrypt | - |
| Signatures | RSA-2048+ or ECDSA P-256 | - |

### Logging Requirements (All Regulations)

```javascript
// Compliance-ready logging
const complianceLog = {
  required_fields: [
    'timestamp',      // ISO 8601
    'user_id',        // Who
    'action',         // What
    'resource',       // On what
    'result',         // Success/failure
    'ip_address',     // From where
    'session_id'      // Session tracking
  ],

  retention: {
    'GDPR': '3 years',
    'HIPAA': '6 years',
    'PCI': '1 year',
    'SOC2': '1 year'
  },

  protection: {
    immutable: true,      // Cannot be modified
    encrypted: true,      // Protected at rest
    access_controlled: true  // Limited access
  }
};
```

### Data Retention

| Regulation | General retention | Notes |
|------------|-------------------|-------|
| GDPR | Minimum necessary | Purpose-specific |
| HIPAA | 6 years | From creation or last use |
| PCI-DSS | 1 year logs | Card data: don't store |
| SOC 2 | 1 year evidence | Audit period + 1 |
