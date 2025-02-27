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

export const FilterInput = styled.input`
  width: 95%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const SelectMulti = styled.select`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  width: 100%;
  height: 15rem;
  font-size: 14px;
`;

export const SelectedItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  max-width: 20rem;
`;

export const SelectedItem = styled.div`
  display: flex;
  padding: 4px 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
`;

export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: red;
  cursor: pointer;
`;

export const AddButton = styled.button`
  margin-left: 8px;
  background: gray;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 24px;
`;

export const PillContainer = styled.div<{ bg?: string }>`
  background-color: ${({ bg }) => bg ? bg : 'red'};
  padding: 1rem;
  width: fit-content;
  border-radius: 10px;
  white-space: nowrap;
  margin-bottom: 1rem;
`

export const Divider = styled.div`
  margin: 3rem 0px;
  border: 5px solid gray;
`

export const GameStatusTable = styled.table`
  width: 100%;
  padding: 20px;
  border: 1px solid #000;
  border-radius: 4px;
  background-color: white;

  display: block;
  max-width: -moz-fit-content;
  max-width: fit-content;
  margin: 0 auto;
  overflow-x: auto;
  white-space: nowrap;

  tr {
    width: 100%;
    td{
      text-align: center;
      padding-bottom: 3em;
      padding-left: 3em;
    }
    th{
      padding-bottom: 3em;
      padding-left: 3em;
    }
  }
  tbody {
    width: 100%;
  }
`;