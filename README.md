# AI 切磋大会积分系统

一个基于 Next.js 和 Notion 数据库的会议积分管理系统。

## 功能特点

- 用户账号激活
- 积分余额查询
- 积分转账功能
- 实时交易记录

## 技术栈

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Notion API
- JWT 认证

## 开发环境设置

1. 克隆项目：
   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   ```bash
   cp .env.example .env.local
   ```
   然后在 `.env.local` 中填入相应的配置值。

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

## Notion 数据库设置

需要在 Notion 中创建以下数据库：

1. 参会者信息表
   - 手机号（主键）
   - 密码
   - 是否已激活
   - 账户余额

2. 摊主信息表
   - 摊位编号（主键）
   - 手机号
   - 账户余额

3. 交易详情表
   - 参会者手机号
   - 摊位编号
   - 摊位名称
   - 转账积分额
   - 备注
   - 交易时间

## 部署

项目可以部署到 Vercel 平台：

1. 在 Vercel 中导入项目
2. 配置环境变量
3. 部署

## 开发注意事项

- 确保所有 API 请求都经过适当的错误处理
- 保持用户界面响应式和用户友好
- 实现适当的安全措施，包括输入验证和认证
- 确保数据一致性，特别是在处理积分转账时

## 许可证

[License Type]
