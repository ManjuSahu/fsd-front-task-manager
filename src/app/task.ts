import { Project } from './project';
import { ParentTask } from './parent-task';
import { User } from './user';

export class Task {

    taskId: Number;
    task: String;
    isParentTask: Boolean;
    priority: Number;
    startDate: Date;
    endDate: Date;
    parentTaskId: Number;
    parentTask: ParentTask;
    projectId: Number;
    project: Project;
    taskOwnerId: Number;
    taskOwner: User;
}
