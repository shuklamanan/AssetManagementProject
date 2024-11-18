import {executeGetApi} from "../ts/apiExecution.ts";
import {getProfileApi} from "./api.ts";

export const profileDetails  = (await executeGetApi(getProfileApi))[1];