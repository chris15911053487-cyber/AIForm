-- 添加菜单报表配置字段到 sys_menus 表
-- PostgreSQL migration for web-admin menu enhancement

ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS menu_kind VARCHAR(32) DEFAULT 'builtin';
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS query_template TEXT;
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS filter_schema_json JSONB;
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS column_labels_json JSONB;
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS column_name_mapping_json JSONB;
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS detail_query_template TEXT;
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS detail_key_column VARCHAR(256);
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS detail_key_param VARCHAR(128) DEFAULT 'detailKey';
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS detail_key_type VARCHAR(32) DEFAULT 'string';
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
ALTER TABLE sys_menus ADD COLUMN IF NOT EXISTS roles_json JSONB;

-- Update existing menus to have default values for new columns
UPDATE sys_menus SET menu_kind = 'builtin' WHERE menu_kind IS NULL;
UPDATE sys_menus SET filter_schema_json = '[]'::jsonb WHERE filter_schema_json IS NULL;
UPDATE sys_menus SET column_labels_json = '{}'::jsonb WHERE column_labels_json IS NULL;
UPDATE sys_menus SET column_name_mapping_json = '{}'::jsonb WHERE column_name_mapping_json IS NULL;
UPDATE sys_menus SET detail_key_param = 'detailKey' WHERE detail_key_param IS NULL;
UPDATE sys_menus SET detail_key_type = 'string' WHERE detail_key_type IS NULL;
UPDATE sys_menus SET roles_json = '[]'::jsonb WHERE roles_json IS NULL;
