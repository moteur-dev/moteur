import { describe, it, expect } from "vitest";
import "../../../plugins/core/autoAssignUser";
import { triggerEvent } from "../../../utils/eventBus";
import { User } from "../../../types/User";
import { ProjectSchema } from "../../../types/Project";

describe("coreAutoAssignUser plugin", () => {
  const user: User = { id: "user1", email: "", password: "" } as any;

  it("should assign user to project if no users", async () => {
    const project: ProjectSchema = { id: "p1", label: "Test", defaultLocale: "en" };

    await triggerEvent("project.beforeCreate", { project, user });

    expect(project.users).toEqual([user.id]);
  });

  it("should not overwrite existing users", async () => {
    const project: ProjectSchema = { id: "p1", label: "Test", users: ["someone"], defaultLocale: "en" };

    await triggerEvent("project.beforeCreate", { project, user });

    expect(project.users).toEqual(["someone"]);
  });
});
