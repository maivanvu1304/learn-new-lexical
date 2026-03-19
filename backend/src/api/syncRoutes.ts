import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";

const syncRouter: Router = createRouter();

syncRouter.post("/sync", (req: Request, res: Response) => {
  res.status(200).json({
    nextCursor: req.body?.sinceCursor ?? "cursor-1",
    ackedMutationIds: [],
    conflicts: [],
    changes: []
  });
});

export { syncRouter };
