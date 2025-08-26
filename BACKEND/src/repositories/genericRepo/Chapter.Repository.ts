import { IChapter,ChapterModel } from "../../models/chapter.Model";

import { GenericRepository } from "./generic.Repository";

export class ChapterDetailRepository extends GenericRepository<IChapter>{
    constructor(){
        super(ChapterModel)
    }
}