import { Router } from 'express';
import { parseRegistrationCommand } from '../utils/command-parser.js';
import { runRegistration } from '../services/automation.service.js';

const router = Router();

/**
 * POST /api/chat/message
 * Body: { text: string }
 *
 * Standard response:
 *   { success: boolean, message: string, data: { kind, ... } }
 *
 * kind:
 *   - "chat"        => normal conversational reply (no automation)
 *   - "automation"  => automation finished, includes status + banner text
 */
router.post('/message', async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Message text is required.',
      data: null,
    });
  }

  const command = parseRegistrationCommand(text);

  if (!command) {
    return res.json({
      success: true,
      message: 'OK',
      data: {
        kind: 'chat',
        reply: getCannedReply(text),
      },
    });
  }

  try {
    const result = await runRegistration(command);
    return res.json({
      success: true,
      message: 'Automation finished.',
      data: {
        kind: 'automation',
        status: result.status,
        banner: result.message,
        userId: result.userId,
        pin: command.pin,
        type: command.type,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Automation failed.',
      data: {
        kind: 'automation',
        status: 'error',
        banner: err?.message ?? 'Unknown automation error.',
        pin: command.pin,
        type: command.type,
      },
    });
  }
});

function getCannedReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi ')) return 'Hi there! How can I help you today?';
  if (lower.includes('help')) {
    return 'Send a registration request like:  /register 050502495531 Member';
  }
  return 'Got it. Type /help to see what I can do.';
}

export default router;
