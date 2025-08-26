import { IChapter,ChapterModel } from "../../models/chapterModel";

import { GenericRepository } from "./generic.Repository";

export class ChapterDetailRepository extends GenericRepository<IChapter>{
    constructor(){
        super(ChapterModel)
    }
}