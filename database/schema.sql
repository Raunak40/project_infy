-- ============================================================
-- Subscription & Billing Management Platform — Full DDL
-- All 15 User Stories
-- ============================================================

CREATE DATABASE IF NOT EXISTS billing_platform;
USE billing_platform;

-- ============================================================
-- BATCH 1 — Core tables (Sprint 1–5)
-- ============================================================

CREATE TABLE roles (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    role_name   VARCHAR(50)  NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (role_name) VALUES ('ADMIN'), ('BILLING_MANAGER'), ('VIEWER');

CREATE TABLE users (
    id          BIGINT        AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_roles (
    user_id  BIGINT NOT NULL,
    role_id  BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE system_config (
    id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
    config_key   VARCHAR(100)  NOT NULL UNIQUE,
    config_value VARCHAR(500)  NOT NULL,
    updated_by   VARCHAR(255),
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default system configuration values
INSERT INTO system_config (config_key, config_value, updated_by) VALUES
    ('tax_rate', '18.0', 'SYSTEM'),
    ('scheduler_cron', '0 0 2 * * ?', 'SYSTEM'),
    ('dunning_day_1', '1', 'SYSTEM'),
    ('dunning_day_2', '7', 'SYSTEM'),
    ('dunning_day_3', '14', 'SYSTEM'),
    ('session_timeout_minutes', '30', 'SYSTEM'),
    ('password_min_length', '8', 'SYSTEM'),
    ('invoice_prefix', 'INV', 'SYSTEM'),
    ('customer_code_prefix', 'CUST', 'SYSTEM'),
    ('currency_default', 'USD', 'SYSTEM');

CREATE TABLE plans (
    id                BIGINT         AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(200)   NOT NULL UNIQUE,
    price             DECIMAL(12,2)  NOT NULL,
    billing_frequency VARCHAR(30)    NOT NULL,
    currency          VARCHAR(10)    NOT NULL DEFAULT 'USD',
    status            VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    setup_fee         DECIMAL(12,2)  DEFAULT 0.00,
    trial_period_days INT            DEFAULT 0,
    tax_applicable    BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customers (
    id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
    customer_code   VARCHAR(20)   NOT NULL UNIQUE,
    name            VARCHAR(200)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    phone           VARCHAR(30),
    billing_address TEXT,
    tax_id          VARCHAR(100),
    status          VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    is_deleted      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subscriptions (
    id                  BIGINT         AUTO_INCREMENT PRIMARY KEY,
    customer_id         BIGINT         NOT NULL,
    plan_id             BIGINT         NOT NULL,
    status              VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    start_date          DATE           NOT NULL,
    next_billing_date   DATE,
    plan_price_snapshot DECIMAL(12,2)  NOT NULL,
    plan_name_snapshot  VARCHAR(200)   NOT NULL,
    cancellation_reason TEXT,
    suspension_reason   TEXT,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_sub_plan     FOREIGN KEY (plan_id)     REFERENCES plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
    id          BIGINT        AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    username    VARCHAR(255),
    action      VARCHAR(100)  NOT NULL,
    entity_type VARCHAR(100)  NOT NULL,
    entity_id   BIGINT,
    old_values  JSON,
    new_values  JSON,
    ip_address  VARCHAR(50),
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_audit_user     ON audit_logs(user_id);
CREATE INDEX idx_audit_entity   ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created  ON audit_logs(created_at);

-- ============================================================
-- BATCH 2 — Invoice, Payment, Discount, Dunning, Tax tables
-- ============================================================

CREATE TABLE invoices (
    id                   BIGINT         AUTO_INCREMENT PRIMARY KEY,
    invoice_number       VARCHAR(50)    NOT NULL UNIQUE,
    customer_id          BIGINT         NOT NULL,
    subscription_id      BIGINT         NOT NULL,
    status               VARCHAR(20)    NOT NULL DEFAULT 'DRAFT',
    subtotal             DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    discount_amount      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax_amount           DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax_rate_snapshot    DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    total_amount         DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    issued_date          DATE,
    due_date             DATE,
    billing_period_start DATE           NOT NULL,
    billing_period_end   DATE           NOT NULL,
    created_at           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_customer     FOREIGN KEY (customer_id)     REFERENCES customers(id),
    CONSTRAINT fk_inv_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
    CONSTRAINT uq_inv_sub_period   UNIQUE (subscription_id, billing_period_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE invoice_line_items (
    id          BIGINT         AUTO_INCREMENT PRIMARY KEY,
    invoice_id  BIGINT         NOT NULL,
    description VARCHAR(500)   NOT NULL,
    quantity    INT            NOT NULL DEFAULT 1,
    unit_price  DECIMAL(12,2)  NOT NULL,
    amount      DECIMAL(12,2)  NOT NULL,
    CONSTRAINT fk_ili_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    invoice_id      BIGINT         NOT NULL,
    amount          DECIMAL(12,2)  NOT NULL,
    payment_date    DATE           NOT NULL,
    payment_method  VARCHAR(50)    NOT NULL,
    notes           TEXT,
    recorded_by     VARCHAR(255)   NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE discount_codes (
    id                  BIGINT         AUTO_INCREMENT PRIMARY KEY,
    code                VARCHAR(50)    NOT NULL UNIQUE,
    type                VARCHAR(20)    NOT NULL,
    value               DECIMAL(12,2)  NOT NULL,
    valid_from          DATE           NOT NULL,
    valid_to            DATE           NOT NULL,
    max_usage_count     INT            NOT NULL DEFAULT 0,
    current_usage_count INT            NOT NULL DEFAULT 0,
    is_active           BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subscription_discount_map (
    subscription_id  BIGINT   NOT NULL,
    discount_code_id BIGINT   NOT NULL,
    applied_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (subscription_id, discount_code_id),
    CONSTRAINT fk_sdm_sub      FOREIGN KEY (subscription_id)  REFERENCES subscriptions(id),
    CONSTRAINT fk_sdm_discount FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE billing_job_runs (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    run_date        DATE         NOT NULL,
    status          VARCHAR(20)  NOT NULL,
    total_processed INT          NOT NULL DEFAULT 0,
    success_count   INT          NOT NULL DEFAULT 0,
    failure_count   INT          NOT NULL DEFAULT 0,
    error_summary   TEXT,
    triggered_by    VARCHAR(255),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE dunning_logs (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    invoice_id      BIGINT       NOT NULL,
    stage           VARCHAR(10)  NOT NULL,
    sent_at         DATETIME,
    status          VARCHAR(20)  NOT NULL,
    attempt_number  INT          NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dun_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tax_config_history (
    id             BIGINT        AUTO_INCREMENT PRIMARY KEY,
    tax_rate       DECIMAL(5,2)  NOT NULL,
    effective_from DATETIME      NOT NULL,
    updated_by     VARCHAR(255)  NOT NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed default admin user (password: Admin@123)
-- BCrypt hash for Admin@123
-- ============================================================
INSERT INTO users (name, email, password, is_active) VALUES
    ('System Admin', 'admin@billing.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES
    (1, 1);
