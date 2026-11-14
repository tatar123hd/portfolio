// Entry point for the home page.
import { initMotion } from './ui/motion.js';
import { mountMiniPlanner } from './ui/mini-planner.js';
import { mountResearchLog } from './ui/research-log.js';
import { mountRanat } from './ui/ranat.js';
import { RESEARCH_LOG } from './data/research-log.js';

function start() {
  initMotion(document);
  mountMiniPlanner(document.getElementById('mini-planner'));
  mountResearchLog(document.getElementById('research-log'), RESEARCH_LOG);
  mountRanat(document.getElementById('ranat'));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
