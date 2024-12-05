# AI Conference Points Management System

A mobile web application for managing participant points and transactions during an AI conference.

## Features

- User activation system with phone number validation
- Point transfer between participants and booths
- Real-time balance checking
- Transaction history
- Secure authentication with JWT

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: Notion
- Authentication: JWT
- Deployment: Vercel

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NOTION_API_KEY=your_notion_api_key
NOTION_PARTICIPANTS_DB=your_participants_database_id
NOTION_BOOTHS_DB=your_booths_database_id
NOTION_TRANSACTIONS_DB=your_transactions_database_id
JWT_SECRET=your_jwt_secret
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Start production server:
```bash
npm start
```

## Notion Database Structure

### Participants Table
- Name (Phone Number)
- Password
- Activation Status
- Account Balance

### Booths Table
- Name (Booth ID)
- Booth Name
- Account Balance

### Transactions Table
- Transaction ID
- Participant Phone
- Booth ID
- Booth Name
- Transfer Amount
- Transaction Notes
- Transaction Timestamp

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
