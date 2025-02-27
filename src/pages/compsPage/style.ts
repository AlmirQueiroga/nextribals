import styled from "styled-components";

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
`;

export const VirtualHeader = styled.div`
  display: flex;
  background-color: #f1f1f1;
  padding: 10px 0;
  font-weight: bold;
`;

export const HeaderCell = styled.div`
  flex: 1;
  text-align: center;
`;

export const RowWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
`;

export const Cell = styled.div`
  flex: 1;
  text-align: center;
  align-content: center;
`;

export const LoadMoreButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  background-color: #0070f3;
  color: white;
  border: none;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;