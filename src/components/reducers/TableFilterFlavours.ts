import { FilterFn, FilterFns, Row } from "@tanstack/react-table"
import { RowDataType } from "cdm/FolderModel"
import { LocalSettings } from "cdm/SettingsModel";
import { InputType } from "helpers/Constants";
import { Link, Literal, STask } from "obsidian-dataview";
import { DataviewService } from "services/DataviewService";
import { LOGGER } from "services/Logger";
import { ParseService } from "services/ParseService";
import { DateTime } from "luxon";

export const globalDatabaseFilterFn: (ddbbConfig: LocalSettings) => FilterFn<RowDataType> = (ddbbConfig: LocalSettings) => (
    row: Row<RowDataType>,
    columnId: string,
    filterValue: string
) => {
    try {
        const value = row.getValue<Literal>(columnId);
        if (value === undefined) {
            return false;
        }
        const sanitized = ParseService.parseLiteral(value, InputType.MARKDOWN, ddbbConfig, true).toString().toLowerCase();

        filterValue = filterValue.toString().toLowerCase();
        return sanitized.includes(filterValue) || searchRegex(sanitized, filterValue);
    } catch (e) {
        LOGGER.error(`Error while searching with globalDatabaseFilterFn: ${e}`);
        return false;
    }
}

function searchRegex(sanitized: string, filterValue: string): boolean {
    try {
        const regex = new RegExp(filterValue);
        return regex.test(sanitized);
    } catch (e) {
        return false;
    }
}

const MarkdownFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, filterValue: string) => {
    try {
        const value = row.getValue<Literal>(columnId);
        const wrapLiteral = DataviewService.wrapLiteral(value);
        if (value === undefined || wrapLiteral.type !== "link") {
            return false;
        }
        // Sanitize the value to obtain the file name
        const sanitized = wrapLiteral.value.fileName().toLowerCase();
        filterValue = filterValue.toString().toLowerCase();
        return sanitized.includes(filterValue) || searchRegex(sanitized, filterValue);
    } catch (e) {
        LOGGER.error(`Error while searching with MarkdownFilterFn: ${e}`);
        return false;
    }
}

const LinksGroupFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, filterValue: string) => {
    try {
        const value = row.getValue<Literal>(columnId);
        const wrapLiteral = DataviewService.wrapLiteral(value);
        if (value === undefined || wrapLiteral.type !== "array") {
            return false;
        }

        return wrapLiteral.value
            .filter((l) => DataviewService.wrapLiteral(l).type === "link")
            .some((l: Link) => {
                // Sanitize the value to obtain the file name
                const sanitized = l.fileName().toLowerCase();
                filterValue = filterValue.toString().toLowerCase();
                return sanitized.includes(filterValue) || searchRegex(sanitized, filterValue);
            });

    } catch (e) {
        LOGGER.error(`Error while searching with MarkdownFilterFn: ${e}`);
        return false;
    }
}

const CalendarGroupFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, dateRange: [Date, Date]) => {
    const value = row.getValue<Literal>(columnId);
    const calendarValue = DateTime.isDateTime(value) ? value.toJSDate() : null;

    // If there is no filter, we return true
    if (!dateRange[0] && !dateRange[1]) {
        return true;
    }

    // If there is no value, we return false
    if (calendarValue === null) {
        return false;
    }

    // If there is no start date, we return true if the value is before the end date
    if (!dateRange[0]) {
        return calendarValue <= dateRange[1];
    }

    // If there is no end date, we return true if the value is after the start date
    if (!dateRange[1]) {
        return calendarValue >= dateRange[0];
    }

    // If there is a start date and an end date, we return true if the value is between the two dates
    return calendarValue >= dateRange[0] && calendarValue <= dateRange[1];
}


const BooleanGroupFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, selectedOption: number) => {
    const value = row.getValue<Literal>(columnId);
    if (selectedOption === undefined || selectedOption === null) {
        return true;
    }

    return Boolean(value) === Boolean(selectedOption);

}

const TagsGroupFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, filterValue: string) => {
    const value = row.getValue<Literal>(columnId);
    const wrapLiteral = DataviewService.wrapLiteral(value);
    if (filterValue === undefined || filterValue === null) {
        return true;
    }

    if (value === undefined || value === null) {
        return false;
    }
    const sanitizedFilterValue = filterValue.toLowerCase();
    if (wrapLiteral.type === "array") {
        return wrapLiteral.value.some((tag) => {
            const sanitizedTag = tag.toString().toLowerCase();
            return sanitizedTag.includes(sanitizedFilterValue) || searchRegex(sanitizedTag, sanitizedFilterValue);
        });
    } else {
        const sanitizedTag = wrapLiteral.value.toString().toLowerCase();
        return sanitizedTag.includes(sanitizedFilterValue) || searchRegex(sanitizedTag, sanitizedFilterValue);
    }
}

const TaskGroupFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, selectedOption: string) => {
    const value = row.getValue<Literal>(columnId) as STask[];
    if (selectedOption === undefined || selectedOption === null) {
        return true;
    }
    const sanitizedSelectedOption = selectedOption.toLowerCase();
    return value.some((task) => {
        // Sanitize the value to obtain the file name
        const sanitized = task.text.toLowerCase();
        return sanitized.includes(sanitizedSelectedOption) || searchRegex(sanitized, sanitizedSelectedOption);
    });
}

const PlainTextGroupFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, selectedOption: string) => {
    const value = row.getValue<Literal>(columnId);
    if (selectedOption === undefined || selectedOption === null) {
        return true;
    }
    if (value === undefined || value === null) {
        return false;
    }

    const sanitizedSelectedOption = selectedOption.toLowerCase();
    const sanitized = value.toString().toLowerCase();
    return sanitized.includes(sanitizedSelectedOption) || searchRegex(sanitized, sanitizedSelectedOption);
}

const NumberGroupFilterFn: FilterFn<RowDataType> = (row: Row<RowDataType>, columnId: string, numberRange: [number, number]) => {
    const value = row.getValue<Literal>(columnId);
    const minRange = numberRange[0];
    const maxRange = numberRange[1];
    if (minRange === undefined && maxRange === undefined) {
        return true;
    }

    const sanitizedValue = Number(value);
    if (value === undefined || value === null || Number.isNaN(sanitizedValue)) {
        return false;
    }

    if (minRange === undefined) {
        return sanitizedValue <= maxRange;
    }

    if (maxRange === undefined) {
        return sanitizedValue >= minRange;
    }

    return sanitizedValue >= minRange && sanitizedValue <= maxRange;
}
const customSortingfns: FilterFns = {
    markdown: MarkdownFilterFn,
    linksGroup: LinksGroupFilterFn,
    calendar: CalendarGroupFilterFn,
    boolean: BooleanGroupFilterFn,
    task: TaskGroupFilterFn,
    tags: TagsGroupFilterFn,
    plainText: PlainTextGroupFilterFn,
    number: NumberGroupFilterFn
};

export default customSortingfns;