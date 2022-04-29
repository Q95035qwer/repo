import { RowType } from "cdm/RowTypeModel"
import { LocalSettings } from "Settings"

/** database column */
export type DatabaseColumn = {
    input: string,
    accessor: string,
    label: string,
    key?: string,
    position?: number,
    isMetadata?: boolean,
    csvCandidate?: boolean,
    [key: string]: RowType
}

/** database yaml */
export type DatabaseYaml = {
    /** database name */
    name: string,
    /** database description */
    description: string,
    /** database columns */
    columns: Record<string, DatabaseColumn>
    /** database local configuration */
    config?: LocalSettings
}