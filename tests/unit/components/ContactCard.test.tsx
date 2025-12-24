import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import { ContactCard } from '@/features/contacts/components/ContactCard';
import type { Contact } from '@/types/database';

const mockContact: Contact = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  emails: [{ value: 'john@example.com', label: 'Work', is_primary: true }],
  phones: [{ value: '+1234567890', label: 'Mobile', is_primary: true }],
  addresses: [],
  job_title: 'Software Engineer',
  description: null,
  tags: ['client', 'tech'],
  avatar_url: null,
  created_by: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('ContactCard', () => {
  it('renders contact name', () => {
    renderWithProviders(<ContactCard contact={mockContact} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders job title', () => {
    renderWithProviders(<ContactCard contact={mockContact} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('renders primary email', () => {
    renderWithProviders(<ContactCard contact={mockContact} />);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderWithProviders(<ContactCard contact={mockContact} />);
    expect(screen.getByText('client')).toBeInTheDocument();
    expect(screen.getByText('tech')).toBeInTheDocument();
  });

  it('links to contact detail page', () => {
    renderWithProviders(<ContactCard contact={mockContact} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/contacts/1');
  });

  it('handles contact without email', () => {
    const contactWithoutEmail = { ...mockContact, emails: [] };
    renderWithProviders(<ContactCard contact={contactWithoutEmail} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Should not throw an error
  });

  it('handles contact without job title', () => {
    const contactWithoutTitle = { ...mockContact, job_title: null };
    renderWithProviders(<ContactCard contact={contactWithoutTitle} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Should not show job title section
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
  });

  it('renders avatar placeholder when no avatar_url', () => {
    renderWithProviders(<ContactCard contact={mockContact} />);
    // Avatar should show initials "JD" or fallback
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });
});

