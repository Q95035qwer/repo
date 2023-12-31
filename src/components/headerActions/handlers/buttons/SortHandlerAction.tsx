import { HeaderActionResponse } from "cdm/HeaderActionModel";
import { AbstractHeaderAction } from "components/headerActions/handlers/AbstractHeaderAction";
import CrossIcon from "components/img/CrossIcon";
import ArrowUpIcon from "components/img/ArrowUp";
import ArrowDownIcon from "components/img/ArrowDown";
import React from "react";
import { TableColumn } from "cdm/FolderModel";
import headerButtonComponent from "components/headerActions/HeaderButtonComponent";
import { t } from "lang/helpers";

export default class SortHandlerAction extends AbstractHeaderAction {
  globalHeaderActionResponse: HeaderActionResponse;
  handle(headerActionResponse: HeaderActionResponse): HeaderActionResponse {
    this.globalHeaderActionResponse = headerActionResponse;
    this.addSortButtons();

    return this.goNext(this.globalHeaderActionResponse);
  }

  /**
   * add sort buttons to the column header. Global header action response is updated.
   */
  private addSortButtons(): void {
    const sortButtons: JSX.Element[] = [];

    sortButtons.push(sortingUpButton(this.globalHeaderActionResponse));

    sortButtons.push(sortingDownButton(this.globalHeaderActionResponse));

    this.globalHeaderActionResponse.buttons.push(...sortButtons);
  }
}

function sortingUpButton(headerActionResponse: HeaderActionResponse) {
  const { hooks } = headerActionResponse;
  const { table, column } = headerActionResponse.headerMenuProps.headerProps;

  const tablecolumn = column.columnDef as TableColumn;
  const columnActions = table.options.meta.tableState.columns(
    (store) => store.actions
  );

  const sortingUpOnClick = async () => {
    tablecolumn.isSorted =
      tablecolumn.isSorted && !tablecolumn.isSortedDesc ? false : true;
    tablecolumn.isSortedDesc = false;
    hooks.setMenuEl(null);
    // Save on memory
    let currentSorting = [...table.options.state.sorting];
    if (tablecolumn.isSorted) {
      currentSorting.remove(
        currentSorting.find((s) => s.id === tablecolumn.id)
      );
      currentSorting.push({
        id: tablecolumn.id,
        desc: tablecolumn.isSortedDesc,
      });
      tablecolumn.sortIndex = currentSorting.length;
    } else {
      currentSorting.remove(
        currentSorting.find((s) => s.id === tablecolumn.id)
      );
      tablecolumn.sortIndex = -1;
    }
    table.setSorting(currentSorting);
    // Save on disk
    columnActions.alterSorting(tablecolumn);
  };

  const isAscSorted = column.getIsSorted() === "asc";
  return headerButtonComponent({
    onClick: sortingUpOnClick,
    icon: isAscSorted ? <CrossIcon /> : <ArrowUpIcon />,
    label: isAscSorted
      ? t("header_menu_sort_ascending_remove")
      : t("header_menu_sort_ascending"),
  });
}

function sortingDownButton(headerActionResponse: HeaderActionResponse) {
  const { hooks } = headerActionResponse;
  const { table, header, column } =
    headerActionResponse.headerMenuProps.headerProps;

  const tablecolumn = column.columnDef as TableColumn;

  const columnActions = table.options.meta.tableState.columns(
    (store) => store.actions
  );

  const sortingDownOnClick = async () => {
    tablecolumn.isSorted =
      tablecolumn.isSorted && tablecolumn.isSortedDesc ? false : true;
    tablecolumn.isSortedDesc = true;

    hooks.setMenuEl(null);
    // Update on memory
    let currentSorting = [...table.options.state.sorting];
    if (tablecolumn.isSorted) {
      currentSorting.remove(
        currentSorting.find((s) => s.id === tablecolumn.id)
      );
      currentSorting.push({
        id: tablecolumn.id,
        desc: tablecolumn.isSortedDesc,
      });
      tablecolumn.sortIndex = currentSorting.length;
    } else {
      currentSorting.remove(
        currentSorting.find((s) => s.id === tablecolumn.id)
      );
      tablecolumn.sortIndex = -1;
    }
    table.setSorting(currentSorting);
    // Update on disk
    columnActions.alterSorting(tablecolumn);
  };

  return headerButtonComponent({
    onClick: sortingDownOnClick,
    icon:
      header.column.getIsSorted() === "desc" ? (
        <CrossIcon />
      ) : (
        <ArrowDownIcon />
      ),
    label:
      header.column.getIsSorted() === "desc"
        ? t("header_menu_sort_descending_remove")
        : t("header_menu_sort_descending"),
  });
}
