import React, { useEffect, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import Badge from 'components/Badge';
import { usePopper } from 'react-popper';
import { randomColor } from 'utils/colors';
import PlusIcon from 'components/img/Plus';
import { ActionTypes, DataTypes } from 'utils/Constants';
import { createPortal } from 'react-dom';

type ColumnProp={
  id:string,
  dataType:any,
  options:any
}

type IndexProp={
  index:number
}

type CellProps={
  initialValue:any,
  row:IndexProp,
  column:ColumnProp,
  dataDispatch:any
}

function grey(value: any){
  let reference = {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  };

  return reference[value as keyof typeof reference];
}

/*
{
  value: initialValue,
  row: { index },
  column: { id, dataType, options },
  dataDispatch,
}
*/
export default function Cell(fn: CellProps) {
  const [value, setValue] = useState({ value: fn.initialValue, update: false });
  const [selectRef, setSelectRef] = useState(null);
  const [selectPop, setSelectPop] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addSelectRef, setAddSelectRef] = useState(null);
  const { styles, attributes } = usePopper(selectRef, selectPop, {
    placement: 'bottom-start',
    strategy: 'fixed',
  });

  function handleOptionKeyDown(e: any) {
    if (e.key === 'Enter') {
      if (e.target.value !== '') {
        fn.dataDispatch({
          type: ActionTypes.ADD_OPTION_TO_COLUMN,
          option: e.target.value,
          backgroundColor: randomColor(),
          columnId: fn.column.id,
        });
      }
      setShowAdd(false);
    }
  }

  function handleAddOption(e: any) {
    setShowAdd(true);
  }

  function handleOptionBlur(e: any) {
    if (e.target.value !== '') {
      fn.dataDispatch({
        type: ActionTypes.ADD_OPTION_TO_COLUMN,
        option: e.target.value,
        backgroundColor: randomColor(),
        columnId: fn.column.id,
      });
    }
    setShowAdd(false);
  }

  function getColor() {
    let match = fn.column.options.find((option:any) => option.label === value.value);
    return (match && match.backgroundColor) || grey(200);
  }

  function onChange(e: any) {
    setValue({ value: e.target.value, update: false });
  }

  function handleOptionClick(option:any) {
    setValue({ value: option.label, update: true });
    setShowSelect(false);
  }

  function getCellElement() {
    switch (fn.column.dataType) {
      case DataTypes.TEXT:
        return (
          <ContentEditable
            html={(value.value && value.value.toString()) || ''}
            onChange={onChange}
            onBlur={() => setValue(old => ({ value: old.value, update: true }))}
            className="data-input"
          />
        );
      case DataTypes.NUMBER:
        return (
          <ContentEditable
            html={(value.value && value.value.toString()) || ''}
            onChange={onChange}
            onBlur={() => setValue(old => ({ value: old.value, update: true }))}
            className="data-input text-align-right"
          />
        );
      case DataTypes.SELECT:
        return (
          <>
            <div
              ref={setSelectRef}
              className="cell-padding d-flex cursor-default align-items-center flex-1"
              onClick={() => setShowSelect(true)}
            >
              {value.value && (
                <Badge value={value.value} backgroundColor={getColor()} />
              )}
            </div>
            {showSelect && (
              <div className="overlay" onClick={() => setShowSelect(false)} />
            )}
            {showSelect &&
              createPortal(
                <div
                  className="shadow-5 bg-white border-radius-md"
                  ref={setSelectPop}
                  {...attributes.popper}
                  style={{
                    ...styles.popper,
                    zIndex: 4,
                    minWidth: 200,
                    maxWidth: 320,
                    maxHeight: 400,
                    padding: '0.75rem',
                    overflow: 'auto',
                  }}
                >
                  <div
                    className="d-flex flex-wrap-wrap"
                    style={{ marginTop: '-0.5rem' }}
                  >
                    {fn.column.options.map((option:any) => (
                      <div
                        className="cursor-pointer mr-5 mt-5"
                        onClick={() => handleOptionClick(option)}
                      >
                        <Badge
                          value={option.label}
                          backgroundColor={option.backgroundColor}
                        />
                      </div>
                    ))}
                    {showAdd && (
                      <div
                        className="mr-5 mt-5 bg-grey-200 border-radius-sm"
                        style={{
                          width: 120,
                          padding: '2px 4px',
                        }}
                      >
                        <input
                          type="text"
                          className="option-input"
                          onBlur={handleOptionBlur}
                          ref={setAddSelectRef}
                          onKeyDown={handleOptionKeyDown}
                        />
                      </div>
                    )}
                    <div
                      className="cursor-pointer mr-5 mt-5"
                      onClick={handleAddOption}
                    >
                      <Badge
                        value={
                          <span className="svg-icon-sm svg-text">
                            <PlusIcon />
                          </span>
                        }
                        backgroundColor={grey(200)}
                      />
                    </div>
                  </div>
                </div>,
                document.querySelector('#popper-portal')
              )}
          </>
        );
      default:
        return <span></span>;
    }
  }

  useEffect(() => {
    if (addSelectRef && showAdd) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAdd]);

  useEffect(() => {
    setValue({ value: fn.initialValue, update: false });
  }, [fn.initialValue]);

  useEffect(() => {
    if (value.update) {
      fn.dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId: fn.column.id,
        rowIndex: fn.row.index,
        value: value.value,
      });
    }
  }, [value, fn.dataDispatch, fn.column.id, fn.row.index]);

  return getCellElement();
}