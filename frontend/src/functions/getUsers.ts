import {IUser} from "./interface.ts";
import {executeGetApi} from "../ts/apiExecution.ts";
import {getAllUsersApi} from "./api.ts";

export const users: IUser[] = (await executeGetApi(getAllUsersApi))[1];