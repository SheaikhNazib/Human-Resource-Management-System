# Human Resource Management System

A comprehensive full-stack HR management system built with modern web technologies. This application provides a complete solution for managing employees, departments, attendances, leaves, performances, salaries, and tasks in an organization.

## 🚀 Features

### Employee Management
- Employee profiles with personal and professional details
- Department and job title assignments
- Role-based access control
- User authentication and authorization

### Attendance Tracking
- Daily attendance records
- Time tracking and reporting
- Attendance analytics

### Leave Management
- Leave request system
- Multiple leave types (vacation, sick, personal)
- Leave approval workflow
- Leave balance tracking

### Performance Management
- Employee performance evaluations
- Performance metrics and ratings
- Review cycles

### Salary & Compensation
- Salary structure management
- Compensation packages
- Salary calculations

### Task Management
- Task assignment and tracking
- Work item management
- Task status updates
- Project organization

## 🛠️ Tech Stack

### Backend (services/hr-api/)
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Migrations**: TypeORM migrations

### Frontend (web/hr-admin/)
- **Framework**: Next.js 13+
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SheaikhNazib/Human-Resource-Management-System.git
   cd Human-Resource-Management-System
   ```

2. **Backend Setup**
   ```bash
   cd services/hr-api
   npm install
   ```

   - Copy `.env.example` to `.env` and configure your database and JWT settings
   - Run database migrations:
     ```bash
     npm run migration:run
     ```
   - Start the development server:
     ```bash
     npm run start:dev
     ```

3. **Frontend Setup**
   ```bash
   cd ../../web/hr-admin
   npm install
   ```

   - Copy `.env.example` to `.env.local` and configure API endpoints
   - Start the development server:
     ```bash
     npm run dev
     ```

## 🚀 Usage

1. Access the admin panel at `http://localhost:3000`
2. API documentation available at `http://localhost:3001/api` (Swagger)
3. Default admin credentials (configure in seed data)

## 📁 Project Structure

```
hr-management/
├── services/
│   └── hr-api/              # NestJS Backend API
│       ├── src/
│       │   ├── modules/     # Feature modules
│       │   ├── models/      # Database entities
│       │   ├── migrations/  # Database migrations
│       │   └── config/      # Configuration files
│       └── package.json
└── web/
    └── hr-admin/            # Next.js Admin Panel
        ├── app/             # Next.js app directory
        ├── components/      # React components
        ├── actions/         # Server actions
        └── package.json
```

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control. Supported roles:
- Admin
- Manager
- Employee

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:
- Users
- Employees
- Departments
- Job Titles
- Attendances
- Leaves
- Performances
- Salary Compensations
- Tasks
- Work Items

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email [your-email@example.com] or create an issue in this repository.

## 🔄 Future Enhancements

- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with third-party HR tools
- [ ] Multi-language support
- [ ] Real-time notifications
- [ ] Employee self-service portal</content>
<parameter name="filePath">E:/WEB Projects/hr-management/README.md