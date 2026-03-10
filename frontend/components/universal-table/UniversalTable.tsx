"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { TableProps } from "./table.types";

// Define types for the action groups and buttons
export type HeaderActionGroup = {
  title: string;
  startingActionGroup: HeaderButton[];
  endActionGroup: HeaderButton[];
};

export type HeaderButton = {
  label: string;
  onClick: (value?: string) => void;
  icon?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "secondary"
    | "edit"
    | "delete"
    | "view"
    | "download";
  className?: string;
  inputClassName?: string;
  selectTriggerCalssName?: string;
  selectItemClassName?: string;
  size?: "sm" | "default" | "lg";
  position?: "left" | "center" | "right";
  visibility?: boolean;
  positionIndex?: number;
  search?: boolean;
  filter?: boolean;
  options?: string[];
};

export type TableSearch = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

interface UniversalTablePropsWithFilters<T> extends TableProps<T> {
  headerActionGroups?: HeaderActionGroup[];
  innerActionGroup?: HeaderActionGroup[];
  headerSearch?: TableSearch;
  inlineSearch?: TableSearch;
}

export default function UniversalTable<T>({
  data,
  columns,
  actions,
  rowKey,
  actionsPosition = "end",
  headerActionGroups = [],
  innerActionGroup = [],
  headerSearch,
  inlineSearch,
}: UniversalTablePropsWithFilters<T>) {
  // State for header and inline search/filter
  const [internalHeaderSearch, setInternalHeaderSearch] = useState("");
  const [internalInlineSearch, setInternalInlineSearch] = useState("");
  const [activeHeaderFilter, setActiveHeaderFilter] = useState<string | null>(
    null,
  );
  const [activeInlineFilter, setActiveInlineFilter] = useState<string | null>(
    null,
  );

  // Controlled or internal search values
  const headerSearchValue = headerSearch?.value ?? internalHeaderSearch;
  const inlineSearchValue = inlineSearch?.value ?? internalInlineSearch;

  const handleHeaderSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalHeaderSearch(e.target.value);
    if (headerSearch?.onChange) {
      headerSearch.onChange(e.target.value);
    }
  };

  const handleInlineSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalInlineSearch(e.target.value);
    if (inlineSearch?.onChange) {
      inlineSearch.onChange(e.target.value);
    }
  };

  // Handle filter change
  const handleHeaderFilterChange = (value: string) => {
    setActiveHeaderFilter(value);
  };

  const handleInlineFilterChange = (value: string) => {
    setActiveInlineFilter(value);
  };

  // Filter data based on search and filters
  const filteredData = data.filter((row) => {
    let matchesHeaderSearch = true;
    let matchesInlineSearch = true;
    let matchesHeaderFilter = true;
    let matchesInlineFilter = true;

    // Header search
    if (headerSearchValue) {
      matchesHeaderSearch = columns.some((col) =>
        String(row[col.key])
          .toLowerCase()
          .includes(headerSearchValue.toLowerCase()),
      );
    }

    // Inline search
    if (inlineSearchValue) {
      matchesInlineSearch = columns.some((col) =>
        String(row[col.key])
          .toLowerCase()
          .includes(inlineSearchValue.toLowerCase()),
      );
    }

    // Header filter
    if (activeHeaderFilter) {
      matchesHeaderFilter = Object.values(row as Record<string, unknown>).some(
        (val) => String(val) === activeHeaderFilter,
      );
    }

    // Inline filter
    if (activeInlineFilter) {
      matchesInlineFilter = Object.values(row as Record<string, unknown>).some(
        (val) => String(val) === activeInlineFilter,
      );
    }

    return (
      matchesHeaderSearch &&
      matchesInlineSearch &&
      matchesHeaderFilter &&
      matchesInlineFilter
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="mx-auto p-5">
        {headerActionGroups.map((group, idx) => (
          <div key={idx} className="mb-4 flex items-center justify-between">
            {group.title && (
              <h2 className="text-2xl font-semibold">{group.title}</h2>
            )}

            <div className="flex items-center gap-2">
              {/* Starting Action Group */}
              {group.startingActionGroup
                .filter((btn) => btn.visibility)
                .sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
                .map((btn, idx) => {
                  // Handle search button
                  if (btn.search) {
                    return (
                      <Input
                        key={idx}
                        placeholder={btn.label || "Search..."}
                        className={btn.inputClassName}
                        onChange={handleHeaderSearch}
                      />
                    );
                  }

                  // Handle filter button
                  if (btn.filter) {
                    console.log(btn);
                    return (
                      <div key={idx}>
                        <Select onValueChange={handleHeaderFilterChange}>
                          <SelectTrigger className={btn.selectTriggerCalssName}>
                            <SelectValue placeholder={btn.label || "Filter"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {btn.options?.map((option, optionIdx) => (
                                <SelectItem
                                  key={optionIdx}
                                  value={option}
                                  className={btn.selectItemClassName}
                                >
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }

                  // Regular button
                  return (
                    <Button
                      key={idx}
                      variant={btn.variant || "default"}
                      className={btn.className || ""}
                      onClick={() => btn.onClick()}
                      size={btn.size || "default"}
                    >
                      {btn.icon}
                      {btn.label}
                    </Button>
                  );
                })}
            </div>
            {/* End Action Group */}
            <div className="flex items-center gap-2">
              {group.endActionGroup
                .filter((btn) => btn.visibility)
                .sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
                .map((btn, idx) => {
                  if (btn.search) {
                    return (
                      <Input
                        key={idx}
                        placeholder={btn.label || "Search..."}
                        className={btn.inputClassName}
                        onChange={handleHeaderSearch}
                      />
                    );
                  }

                  if (btn.filter) {
                    return (
                      <Select
                        key={idx}
                        onValueChange={handleHeaderFilterChange}
                      >
                        <SelectTrigger className={btn.selectTriggerCalssName}>
                          <SelectValue placeholder={btn.label || "Filter"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {btn.options?.map((option, optionIdx) => (
                              <SelectItem
                                className={btn.selectItemClassName}
                                key={optionIdx}
                                value={option}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    );
                  }

                  return (
                    <Button
                      key={idx}
                      variant={btn.variant || "default"}
                      className={btn.className}
                      onClick={() => btn.onClick()}
                      size={btn.size || "default"}
                    >
                      {btn.label}
                    </Button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full overflow-x-auto rounded-lg bg-[#F9F9FA] shadow-sm">
        {/* Inner */}
        <div className="mx-auto">
          {/* Inner Action Groups */}
          {innerActionGroup.map((group, idx) => (
            <div key={idx} className="mb-4 flex items-center justify-between">
              {group.title && (
                <h2 className="text-2xl font-semibold">{group.title}</h2>
              )}

              <div className="flex items-center gap-2">
                {/* Starting Action Group for Inner Actions */}
                {group.startingActionGroup
                  .filter((btn) => btn.visibility)
                  .sort(
                    (a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0),
                  )
                  .map((btn, idx) => {
                    if (btn.search) {
                      return (
                        <Input
                          key={idx}
                          placeholder={btn.label || "Search..."}
                          className={btn.inputClassName}
                          onChange={handleInlineSearch} // Pass value on input change
                        />
                      );
                    }

                    if (btn.filter) {
                      return (
                        <div
                          key={idx}
                          className={btn.className || "w-40 bg-white"}
                        >
                          <Select onValueChange={handleInlineFilterChange}>
                            <SelectTrigger
                              className={btn.selectTriggerCalssName}
                            >
                              <SelectValue
                                placeholder={btn.label || "Filter"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {btn.options?.map((option, optionIdx) => (
                                  <SelectItem
                                    key={optionIdx}
                                    value={option}
                                    className={btn.selectItemClassName}
                                  >
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    // Regular button
                    return (
                      <Button
                        key={idx}
                        variant={btn.variant || "default"}
                        className={btn.className || ""}
                        onClick={() => btn.onClick()}
                        size={btn.size || "default"}
                      >
                        {btn.label}
                      </Button>
                    );
                  })}
              </div>

              <div className="flex items-center gap-2">
                {/* End Action Group for Inner Actions */}
                {group.endActionGroup
                  .filter((btn) => btn.visibility)
                  .sort(
                    (a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0),
                  )
                  .map((btn, idx) => {
                    if (btn.search) {
                      return (
                        <Input
                          key={idx}
                          placeholder={btn.label || "Search..."}
                          className={btn.inputClassName}
                          onChange={handleInlineSearch}
                        />
                      );
                    }

                    if (btn.filter) {
                      return (
                        <Select
                          key={idx}
                          onValueChange={handleInlineFilterChange}
                        >
                          <SelectTrigger className={btn.selectTriggerCalssName}>
                            <SelectValue placeholder={btn.label || "Filter"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {btn.options?.map((option, optionIdx) => (
                                <SelectItem
                                  key={optionIdx}
                                  value={option}
                                  className={btn.selectItemClassName}
                                >
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      );
                    }

                    return (
                      <Button
                        key={idx}
                        variant={btn.variant || "default"}
                        className={btn.className}
                        onClick={() => btn.onClick()}
                        size={btn.size || "default"}
                      >
                        {btn.label}
                      </Button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="p-5">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                {/* Actions at the start */}
                {actions && actionsPosition === "start" && (
                  <TableHead className="">Actions</TableHead>
                )}
                {columns.map((col) => (
                  <TableHead key={String(col.key)} className="">
                    {col.title}
                  </TableHead>
                ))}
                {/* Actions at the end */}
                {actions && actionsPosition === "end" && (
                  <TableHead className="">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow key={rowKey(row)} className="border-0">
                    {/* Starting Action Group in Row */}
                    {actions && actionsPosition === "start" && (
                      <TableCell className="flex gap-2">
                        {actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant={action.variant || "default"}
                            size="sm"
                            onClick={() => action.onClick(row)}
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </TableCell>
                    )}

                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className="min-w-25">
                        {col.render ? col.render(row) : String(row[col.key])}
                      </TableCell>
                    ))}

                    {/* End Action Group in Row */}
                    {actions && actionsPosition === "end" && (
                      <TableCell className="flex gap-2">
                        {actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant={action.variant || "default"}
                            size="sm"
                            onClick={() => action.onClick(row)}
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="py-4 text-center"
                  >
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
