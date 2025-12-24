# Carbide CRM

Internal CRM for the NineOneSix Systems ecosystem. Carbide serves as the relationship management layer across all six ventures (Forge, Hearth, Anvil, Crucible, Foundry, and Carbide itself), handling the complexity of contacts and organizations that exist in multiple relationship contexts simultaneously.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: (To be determined)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nine-one-six-systems/carbide_crm.git
cd carbide_crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── lib/          # Utilities and Supabase client
├── components/   # React components
├── types/        # TypeScript type definitions
├── hooks/        # Custom React hooks
└── pages/        # Page components
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Documentation

See `carbide-prd-v2.md` for the complete Product Requirements Document.

## License

Proprietary - NineOneSix Systems
