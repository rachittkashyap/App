const Course = require('../models/Course');
const Training = require('../models/Training');

function getModel(itemType) {
  if (itemType === 'COURSE') return Course;
  if (itemType === 'TRAINING') return Training;
  return null;
}

async function findItem(itemType, itemId) {
  const Model = getModel(itemType);
  if (!Model) return null;
  return Model.findById(itemId);
}

// Returns a flat list of { groupId, subItemId } for every lesson (course) or
// task (training) in the item - used to compute progress percent and to
// validate that a lessonId/taskId actually belongs to this item.
function getFlatSubItems(itemType, item) {
  if (itemType === 'COURSE') {
    const flat = [];
    item.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        flat.push({ groupId: module._id, subItemId: lesson._id, type: lesson.type });
      });
    });
    return flat;
  }
  if (itemType === 'TRAINING') {
    const flat = [];
    item.days.forEach((day) => {
      day.tasks.forEach((task) => {
        flat.push({ groupId: day._id, subItemId: task._id, type: task.type });
      });
    });
    return flat;
  }
  return [];
}

function computeProgressPercent(totalCount, completedCount) {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

module.exports = { getModel, findItem, getFlatSubItems, computeProgressPercent };
