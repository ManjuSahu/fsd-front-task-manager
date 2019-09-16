import { User } from './user';

export class Project {

    projectId: Number;
    project: String;
    priority: Number;
    startDate: Date;
    endDate: Date;
    managerId: Number;
    managerName: String;
    manager: User;
    status: String;
}
