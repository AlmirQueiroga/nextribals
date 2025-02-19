import { styled } from "styled-components";


export const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectButton = styled.button`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  text-align: left;
`;

export const GameStatusTable = styled.table`
  width: 100%;
  padding: 8px;
  border: 1px solid #000;
  border-radius: 4px;
  background-color: white;

  tr {
    margin: 4rem;
    width: 100%;
    td{
      text-align: center;
    }
  }
`;

export const OptionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const OptionItem = styled.li`
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
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
  align-items: center;
  padding: 4px 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
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

export const FilterInput = styled.input`
  width: 95%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const RemoveButton = styled.button`
  margin-left: 8px;
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