/**
 * Table Component
 * 
 * A standardized table component with striped rows, hover effects, and compact mode.
 */

import { forwardRef } from 'react';
import { cn } from '../../utilities';
import {
  TableProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableHeaderProps,
} from './Table.types';

/**
 * Table component with striped rows, hover effects, and compact mode.
 * 
 * @example
 * ```tsx
 * <Table striped hover>
 *   <TableHead>
 *     <TableRow>
 *       <TableHeader>Name</TableHeader>
 *       <TableHeader>Email</TableHeader>
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ striped, hover, compact, className, children, ...props }, ref) => {
    return (
      <div className="table-wrapper">
        <table
          ref={ref}
          className={cn(
            'table-base',
            striped && 'table-striped',
            hover && 'table-hover',
            compact && 'table-compact',
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead ref={ref} className={cn('table-head', className)} {...props}>
        {children}
      </thead>
    );
  }
);

TableHead.displayName = 'TableHead';

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={cn('table-body', className)} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tr ref={ref} className={cn('table-row', className)} {...props}>
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td ref={ref} className={cn('table-cell', className)} {...props}>
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th ref={ref} className={cn('table-header', className)} {...props}>
        {children}
      </th>
    );
  }
);

TableHeader.displayName = 'TableHeader';

