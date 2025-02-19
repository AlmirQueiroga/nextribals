import styled from 'styled-components';

export const theme = {
    colors: {
      primary: '#007bff', 
      secondary: '#6c757d', 
      background: '#f8f9fa', 
      text: '#212529', 
      white: '#ffffff', 
    },
    fonts: {
      primary: 'Arial, sans-serif', 
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px',
    },
  };

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.fonts.primary};
  color: ${({ theme }) => theme.colors.text};
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

export const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
`;

export const Tabs = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

export const TabButton = styled.button<{ active: boolean }>`
  background-color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 16px;
  margin-right: ${({ theme }) => theme.spacing.small};

  &:hover {
    background-color: ${({ active, theme }) => active ? '#0056b3' : '#5a6268'};
  }
`;

export const TabContent = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid #ddd;
  border-radius: 0 4px 4px 4px;
`;