import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: number;
  title: string;
  description: string;
  effortDays: number;
  dueDate: string;
}

interface TaskTableProps {
  tasks: Task[];
  selected: number[];
  onSelect: (id: number) => void;
}

export const TaskTable = ({ tasks, selected, onSelect }: TaskTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Select</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Effort</TableCell>
          <TableCell>Due Date</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <Checkbox
                checked={selected.includes(task.id)}
                onCheckedChange={() => onSelect(task.id)}
              />
            </TableCell>
            <TableCell>{task.title}</TableCell>
            <TableCell>{task.description}</TableCell>
            <TableCell>{task.effortDays}</TableCell>
            <TableCell>{task.dueDate}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
