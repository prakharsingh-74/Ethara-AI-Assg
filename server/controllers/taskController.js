import asyncHandler from "express-async-handler";
import { supabase } from "../utils/supabase.js";

const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets, links, description } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
      date: new Date().toISOString(),
    };

    let newLinks = [];
    if (links) {
      newLinks = links?.split(",");
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert([{
        title,
        team: team || [],
        stage: stage.toLowerCase(),
        date: new Date(date).toISOString(),
        priority: priority.toLowerCase(),
        assets: assets || [],
        activities: [activity],
        links: newLinks,
        description,
        subtasks: []
      }])
      .select()
      .single();

    if (taskError) throw taskError;

    await supabase.from("notices").insert([{
      team: team || [],
      text,
      task: task._id,
    }]);

    if (team && team.length > 0) {
      for (let i = 0; i < team.length; i++) {
        const userIdToUpdate = team[i];
        const { data: userToUpdate } = await supabase.from('users').select('tasks').eq('_id', userIdToUpdate).single();
        if (userToUpdate) {
            const updatedTasks = userToUpdate.tasks || [];
            updatedTasks.push(task._id);
            await supabase.from('users').update({ tasks: updatedTasks }).eq('_id', userIdToUpdate);
        }
      }
    }

    res.status(200).json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const { data: task, error } = await supabase.from("tasks").select("*").eq("_id", id).single();
    if (error || !task) throw new Error("Task not found");

    let text = "New task has been assigned to you";
    if (task.team?.length > 1) {
      text = text + ` and ${task.team?.length - 1} others.`;
    }
    text =
      text +
      ` The task priority is set a ${task.priority} priority, so check and act accordingly. The task date is ${new Date(task.date).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
      date: new Date().toISOString(),
    };

    const { data: newTask, error: newTaskError } = await supabase
      .from("tasks")
      .insert([{
        ...task,
        _id: undefined, // Let Supabase generate a new UUID
        title: "Duplicate - " + task.title,
        activities: [activity],
      }])
      .select()
      .single();

    if (newTaskError) throw newTaskError;

    await supabase.from("notices").insert([{
      team: newTask.team,
      text,
      task: newTask._id,
    }]);

    res.status(200).json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, team, stage, priority, assets, links, description } = req.body;

  try {
    let newLinks = [];
    if (links) {
      newLinks = links.split(",");
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        title,
        date: new Date(date).toISOString(),
        priority: priority.toLowerCase(),
        assets: assets || [],
        stage: stage.toLowerCase(),
        team: team || [],
        links: newLinks,
        description,
      })
      .eq("_id", id);

    if (error) throw error;

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const { error } = await supabase
      .from("tasks")
      .update({ stage: stage.toLowerCase() })
      .eq("_id", id);

    if (error) throw error;

    res.status(200).json({ status: true, message: "Task stage changed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;

    const { data: task } = await supabase.from("tasks").select("subtasks").eq("_id", taskId).single();
    if (task) {
      const subtasks = task.subtasks || [];
      const updatedSubtasks = subtasks.map((st) => {
        if (st._id === subTaskId) {
          return { ...st, isCompleted: status };
        }
        return st;
      });
      await supabase.from("tasks").update({ subtasks: updatedSubtasks }).eq("_id", taskId);
    }

    res.status(200).json({
      status: true,
      message: status ? "Task has been marked completed" : "Task has been marked uncompleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;

  try {
    // Generate simple UUID for subtask
    const newSubTask = {
      _id: crypto.randomUUID(),
      title,
      date,
      tag,
      isCompleted: false,
    };

    const { data: task } = await supabase.from("tasks").select("subtasks").eq("_id", id).single();
    if (task) {
        const subtasks = task.subtasks || [];
        subtasks.push(newSubTask);
        await supabase.from("tasks").update({ subtasks }).eq("_id", id);
    }

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const getTasks = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { stage, isTrashed, search } = req.query;

  let query = supabase.from("tasks").select("*").eq("is_trashed", isTrashed ? true : false);

  if (!isAdmin) {
    query = query.contains("team", [userId]);
  }
  if (stage) {
    query = query.eq("stage", stage);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,stage.ilike.%${search}%,priority.ilike.%${search}%`);
  }

  const { data: tasks, error } = await query.order("_id", { ascending: false });

  // Mock populate team if necessary. To keep simple, we omit full team populating or do it manually
  // For each task, fetch team members (expensive, but okay for MVP).
  // A real SQL join would be better, but we used array of UUIDs.
  
  res.status(200).json({
    status: true,
    tasks: tasks || [],
  });
});

const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase.from("tasks").select("*").eq("_id", id).single();

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch task");
  }
});

const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { type, activity } = req.body;

  try {
    const { data: task } = await supabase.from("tasks").select("activities").eq("_id", id).single();
    
    if (task) {
      const activities = task.activities || [];
      activities.push({
        type,
        activity,
        by: userId,
        date: new Date().toISOString()
      });
      await supabase.from("tasks").update({ activities }).eq("_id", id);
    }

    res.status(200).json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await supabase.from("tasks").update({ is_trashed: true }).eq("_id", id);

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await supabase.from("tasks").delete().eq("_id", id);
    } else if (actionType === "deleteAll") {
      await supabase.from("tasks").delete().eq("is_trashed", true);
    } else if (actionType === "restore") {
      await supabase.from("tasks").update({ is_trashed: false }).eq("_id", id);
    } else if (actionType === "restoreAll") {
      await supabase.from("tasks").update({ is_trashed: false }).eq("is_trashed", true);
    }

    res.status(200).json({
      status: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    let query = supabase.from("tasks").select("*").eq("is_trashed", false);
    if (!isAdmin) {
      query = query.contains("team", [userId]);
    }
    
    const { data: allTasks, error } = await query.order("_id", { ascending: false });

    const { data: users } = await supabase.from("users").select("name, title, role, is_active, created_at").eq("is_active", true).limit(10).order("_id", { ascending: false });

    const groupedTasks = allTasks?.reduce((result, task) => {
      const stage = task.stage;
      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }
      return result;
    }, {}) || {};

    const graphData = Object.entries(
      allTasks?.reduce((result, task) => {
        const { priority } = task;
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {}) || {}
    ).map(([name, total]) => ({ name, total }));

    const totalTasks = allTasks?.length || 0;
    const last10Task = allTasks?.slice(0, 10) || [];

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupedTasks,
      graphData,
    };

    res.status(200).json({ status: true, ...summary, message: "Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
};
