import { DataState, DataStateActions, DataStateInfo, TableActionResponse } from "cdm/TableStateInterface";
import { create } from "zustand";
import data_state_actions from "stateManagement/data/DataStateActions";
import { CustomView } from "views/AbstractView";

const useDataStore = (view: CustomView) => {
    return create<DataState>()((set, get) => {
        const mockActions: DataStateActions = {
            insertRows: async () => {
                const rows = await view.getRows();
                set(update => {
                    return {
                        ...update,
                        rows: rows
                    }
                })
            },
            addRow: null,
            updateCell: null,
            updateDataAfterLabelChange: null,
            updateBidirectionalRelation: null,
            removeRow: null,
            editOptionForAllRows: null,
            removeDataOfColumn: null,
            removeOptionForAllRows: null,
            parseDataOfColumn: null,
            dataviewRefresh: null,
            dataviewUpdater: null,
            renameFile: null,
            importRowsFromCSV: null,
            groupFiles: null,
            bulkRowUpdate: null,
        }

        const mockInfo: DataStateInfo = {
            getRows: null
        }

        const tableActionResponse: TableActionResponse<DataState> = {
            view: view,
            set: set,
            get: get,
            implementation: {
                actions: mockActions,
                info: mockInfo,
                rows: []
            },
        };
        const dataActions = data_state_actions.run(tableActionResponse);
        return dataActions.implementation;
    });
}

export default useDataStore;
