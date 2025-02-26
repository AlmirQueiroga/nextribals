import { SelectedItem } from "@/styles";
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

export const SelectedRelacItem = styled(SelectedItem)`
  min-width: 100%;
  justify-content: space-between;
  .inputs{
    display: flex;
    flex-direction: column;
    align-self: center;
  }

  div {
    display: flex;
    flex-direction: row;
    
    input {
      max-height: 2rem;
      margin-left: 1rem;
    }
  }
`