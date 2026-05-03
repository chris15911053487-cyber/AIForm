-- 租户表
CREATE TABLE IF NOT EXISTS sys_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE IF NOT EXISTS sys_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    real_name VARCHAR(100),
    avatar VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    department_id UUID,
    last_login_at TIMESTAMP,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE IF NOT EXISTS sys_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES sys_roles(id),
    is_system BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- 用户角色关联
CREATE TABLE IF NOT EXISTS sys_user_roles (
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES sys_roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 资源表
CREATE TABLE IF NOT EXISTS sys_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    parent_id UUID REFERENCES sys_resources(id),
    path VARCHAR(500),
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色权限关联
CREATE TABLE IF NOT EXISTS sys_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES sys_roles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES sys_resources(id),
    actions VARCHAR(50)[] NOT NULL,
    conditions JSONB,
    field_permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, resource_id)
);

-- 菜单表
CREATE TABLE IF NOT EXISTS sys_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    parent_id UUID REFERENCES sys_menus(id),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    path VARCHAR(500),
    component VARCHAR(500),
    sort INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    cache BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 数据源表
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 表单定义表
CREATE TABLE IF NOT EXISTS form_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    name VARCHAR(200) NOT NULL,
    key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    schema JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'published',
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 表单数据表
CREATE TABLE IF NOT EXISTS form_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    form_id UUID NOT NULL REFERENCES form_definitions(id),
    data JSONB NOT NULL DEFAULT '{}',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 种子数据：默认租户和角色
INSERT INTO sys_tenants (id, code, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'default', '默认租户')
ON CONFLICT (code) DO NOTHING;

INSERT INTO sys_roles (id, tenant_id, code, name, is_system) VALUES
    ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'admin', '超级管理员', TRUE)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- 种子数据：默认菜单
INSERT INTO sys_menus (id, tenant_id, name, icon, path, sort) VALUES
    ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', '仪表盘', 'dashboard', '/dashboard', 1),
    ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000001', '系统管理', 'setting', '/system', 2),
    ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '用户管理', 'user', '/system/users', 1),
    ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '角色管理', 'team', '/system/roles', 2),
    ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', '菜单管理', 'menu', '/system/menus', 3)
ON CONFLICT DO NOTHING;

UPDATE sys_menus SET parent_id = '00000000-0000-0000-0000-000000000200' WHERE id IN ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000203');
