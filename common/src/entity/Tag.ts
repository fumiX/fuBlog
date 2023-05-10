import { AutoMap } from "@automapper/classes";

export class Tag {
  @AutoMap()
  id?: number;
  @AutoMap()
  name: string;
}
