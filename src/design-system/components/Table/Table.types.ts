/**
 * Table Component Types
 * 
 * TypeScript types and interfaces for the Table component.
 */

import { TableHTMLAttributes, HTMLAttributes } from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}
export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}
export interface TableHeaderProps extends HTMLAttributes<HTMLTableCellElement> {}

