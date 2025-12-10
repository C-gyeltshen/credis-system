# Credis - Credit Management System

A digital credit management solution designed specifically for Bhutanese shop owners to efficiently track borrower information, manage credit transactions, and automate payment reminders.

## Features

### 🏪 **Borrower Management**
- Add, update, and manage borrower profiles
- Comprehensive customer information tracking
- Credit history management

### 💳 **Transaction Tracking**
- Record credit entries and repayments
- Real-time outstanding balance calculations
- Transaction history tracking

### 📱 **SMS Reminders**
- Automated monthly payment reminders
- Direct SMS integration
- Customizable notification templates

### 📊 **Financial Insights**
- Real-time credit portfolio overview
- Payment pattern analytics
- Outstanding credit monitoring

### 🔒 **Security & Reliability**
- Bank-grade security with Supabase
- Encrypted data storage
- Secure user authentication

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd credis-system/credis-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to the `.env.local` file
   - Set up authentication in the Supabase dashboard

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The application uses Supabase for authentication and will need the following database schema (to be implemented):

```sql
-- Users profile table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  shop_name TEXT,
  owner_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Borrowers table
CREATE TABLE borrowers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  national_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credits table
CREATE TABLE credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_id UUID REFERENCES borrowers ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'active', -- active, paid, overdue
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_id UUID REFERENCES credits ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- credit, payment
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features Roadmap

### Phase 1 (Current MVP)
- [x] Landing page
- [x] User authentication (login/register)
- [x] Basic dashboard
- [ ] Borrower management
- [ ] Transaction recording
- [ ] SMS notification setup

### Phase 2 (Future)
- [ ] Advanced analytics
- [ ] Multi-branch support
- [ ] Accountant role management
- [ ] RMA integration
- [ ] Mobile app

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@credis.bt
- Documentation: [Coming Soon]
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)

---

**Made with ❤️ for Bhutanese Businesses**
