<template>
  <div>
    <h3>仪表盘</h3>
    <el-card style="margin-top: 16px;">
      <p style="color: #999;">欢迎使用低代码平台管理端。请从左侧菜单选择功能模块。</p>
    </el-card>
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="8">
        <el-card>
          <template #header>用户管理</template>
          <p style="color: #999;">管理系统用户</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>菜单管理</template>
          <p style="color: #999;">管理系统菜单</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>表单管理</template>
          <p style="color: #999;">管理表单定义（开发中）</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
