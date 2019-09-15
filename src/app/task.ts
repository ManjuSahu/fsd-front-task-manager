import { Project } from './project';

export class Task {

    taskId: Number;
    task: String;
    isParentTask: Boolean;
    priority: Number;
    startDate: Date;
    endDate: Date;
    parentTaskId: Number;
    projectId: Number;
    project: Project;
    
}
