import type { ReactNode } from 'react';
import { Bot, Code2, FileText, Globe, MessageSquare, PenLine, Square } from 'lucide-react';
import i18n from '../i18n';
import type { WorkflowDefinition } from '../types';

export interface WorkflowTemplate {
  id: string;
  icon: ReactNode;
  name: string;
  description: string;
  build: () => WorkflowDefinition;
}

const isZh = () => Boolean(i18n.language?.startsWith('zh'));
const L = (zh: string, en: string) => (isZh() ? zh : en);

function node(id: string, type: string, x: number, y: number, data: Record<string, unknown>) {
  return { id, type, meta: { position: { x, y } }, data };
}

/** 空白画布：start → end */
function buildBlank(): WorkflowDefinition {
  return {
    nodes: [
      node('start_0', 'start', 0, 100, {
        title: L('开始', 'Start'),
        inputParams: [{ name: 'input', label: L('输入', 'Input'), type: 'text' }],
      }),
      node('end_0', 'end', 500, 100, {
        title: L('结束', 'End'),
        outputParams: [{ name: 'result', label: L('结果', 'Result'), expr: '{{nodes.start_0.input}}' }],
      }),
    ],
    edges: [{ sourceNodeID: 'start_0', targetNodeID: 'end_0' }],
  };
}

/**
 * 聊天机器人：start → llm → end
 * 输入：message（用户消息）
 * 输出：AI 回复
 */
function buildChatbot(): WorkflowDefinition {
  return {
    nodes: [
      node('start_0', 'start', 0, 100, {
        title: L('开始', 'Start'),
        inputParams: [{ name: 'message', label: L('用户消息', 'User Message'), type: 'text' }],
      }),
      node('llm_reply', 'llm', 380, 60, {
        title: L('AI 回复', 'AI Reply'),
        systemPrompt: L(
          '你是一个友好、专业的智能助手。请根据用户的问题给出清晰、有帮助的回答。回答要简洁明了，控制在 200 字以内，必要时使用列表格式。',
          'You are a friendly and professional AI assistant. Provide clear, helpful answers. Keep responses concise (under 200 words), using lists when appropriate.',
        ),
        prompt: L(
          '用户消息：{{input.message}}\n\n请给出回答。',
          'User message: {{input.message}}\n\nPlease reply.',
        ),
      }),
      node('end_0', 'end', 760, 100, {
        title: L('结束', 'End'),
        outputParams: [{ name: 'reply', label: L('AI 回复', 'AI Reply'), expr: '{{nodes.llm_reply.text}}' }],
      }),
    ],
    edges: [
      { sourceNodeID: 'start_0', targetNodeID: 'llm_reply' },
      { sourceNodeID: 'llm_reply', targetNodeID: 'end_0' },
    ],
  };
}

/**
 * AI写作助手：start → 起草 → 润色 → end
 * 输入：topic（主题）、requirements（写作要求，可选）
 * 输出：polished（润色后全文）、draft（初稿）
 */
function buildWriter(): WorkflowDefinition {
  return {
    nodes: [
      node('start_0', 'start', 0, 120, {
        title: L('开始', 'Start'),
        inputParams: [
          { name: 'topic', label: L('主题', 'Topic'), type: 'text' },
          { name: 'requirements', label: L('写作要求', 'Requirements'), type: 'text' },
        ],
      }),
      node('llm_draft', 'llm', 360, 80, {
        title: L('起草内容', 'Draft'),
        systemPrompt: L(
          '你是一位专业的内容创作者，擅长撰写清晰、有说服力的文章。',
          'You are a professional content creator who writes clear, compelling articles.',
        ),
        prompt: L(
          '请根据以下信息撰写一篇文章：\n主题：{{input.topic}}\n要求：{{input.requirements}}\n\n要求：结构清晰，约 400 字，分段落输出。',
          'Write an article based on:\nTopic: {{input.topic}}\nRequirements: {{input.requirements}}\n\nStructure it clearly, around 400 words, with paragraphs.',
        ),
      }),
      node('llm_polish', 'llm', 740, 80, {
        title: L('润色优化', 'Polish'),
        systemPrompt: L(
          '你是一位资深文字编辑，专注于提升文章的可读性和专业感。保留原文核心内容，修正语病，优化表达，让文章更流畅自然。',
          'You are a seasoned copy editor. Keep the core content, fix grammar, improve readability and flow.',
        ),
        prompt: L(
          '请对以下文章进行润色，保持原意，提升表达质量：\n\n{{nodes.llm_draft.text}}',
          'Polish the following article while preserving its meaning:\n\n{{nodes.llm_draft.text}}',
        ),
      }),
      node('end_0', 'end', 1120, 120, {
        title: L('结束', 'End'),
        outputParams: [
          { name: 'polished', label: L('润色结果', 'Polished'), expr: '{{nodes.llm_polish.text}}' },
          { name: 'draft', label: L('初稿', 'Draft'), expr: '{{nodes.llm_draft.text}}' },
        ],
      }),
    ],
    edges: [
      { sourceNodeID: 'start_0', targetNodeID: 'llm_draft' },
      { sourceNodeID: 'llm_draft', targetNodeID: 'llm_polish' },
      { sourceNodeID: 'llm_polish', targetNodeID: 'end_0' },
    ],
  };
}

/**
 * 翻译助手：start → llm → end
 * 输入：text（待翻译文本）、target_language（目标语言）
 * 输出：AI 翻译结果
 */
function buildTranslator(): WorkflowDefinition {
  return {
    nodes: [
      node('start_0', 'start', 0, 100, {
        title: L('开始', 'Start'),
        inputParams: [
          { name: 'text', label: L('待翻译文本', 'Text to Translate'), type: 'text' },
          { name: 'target_language', label: L('目标语言', 'Target Language'), type: 'text' },
        ],
      }),
      node('llm_translate', 'llm', 380, 60, {
        title: L('AI 翻译', 'AI Translate'),
        systemPrompt: L(
          '你是一位专业翻译，精通多国语言。翻译时忠实原文，语言自然流畅，符合目标语言的表达习惯。只输出译文，不加任何解释或注释。',
          'You are a professional translator fluent in many languages. Produce faithful, natural-sounding translations. Output only the translation, no explanations.',
        ),
        prompt: L(
          '请将以下文本翻译成{{input.target_language}}：\n\n{{input.text}}',
          'Translate the following text into {{input.target_language}}:\n\n{{input.text}}',
        ),
      }),
      node('end_0', 'end', 760, 100, {
        title: L('结束', 'End'),
        outputParams: [{ name: 'translation', label: L('译文', 'Translation'), expr: '{{nodes.llm_translate.text}}' }],
      }),
    ],
    edges: [
      { sourceNodeID: 'start_0', targetNodeID: 'llm_translate' },
      { sourceNodeID: 'llm_translate', targetNodeID: 'end_0' },
    ],
  };
}

/**
 * 文本摘要：start → llm → end
 * 输入：content（长文内容）、length（摘要长度，可选）
 * 输出：摘要
 */
function buildSummarizer(): WorkflowDefinition {
  return {
    nodes: [
      node('start_0', 'start', 0, 100, {
        title: L('开始', 'Start'),
        inputParams: [
          { name: 'content', label: L('待摘要内容', 'Content to Summarize'), type: 'text' },
          { name: 'length', label: L('摘要长度要求', 'Length Requirement'), type: 'text' },
        ],
      }),
      node('llm_summary', 'llm', 380, 60, {
        title: L('生成摘要', 'Summarize'),
        systemPrompt: L(
          '你是一位专业的文本摘要专家。提炼文章的核心要点，输出结构清晰的摘要，包含：① 核心主旨一句话 ② 关键要点（3-5 条）③ 结论或建议（如有）。',
          'You are a professional summarization expert. Extract core points and output: ① One-sentence main idea ② Key points (3-5) ③ Conclusion/recommendation if any.',
        ),
        prompt: L(
          '请对以下内容生成摘要{{input.length}}：\n\n{{input.content}}',
          'Summarize the following content{{input.length}}:\n\n{{input.content}}',
        ),
      }),
      node('end_0', 'end', 760, 100, {
        title: L('结束', 'End'),
        outputParams: [{ name: 'summary', label: L('摘要', 'Summary'), expr: '{{nodes.llm_summary.text}}' }],
      }),
    ],
    edges: [
      { sourceNodeID: 'start_0', targetNodeID: 'llm_summary' },
      { sourceNodeID: 'llm_summary', targetNodeID: 'end_0' },
    ],
  };
}

/**
 * 代码助手：start → llm → end
 * 输入：requirement（需求描述）、language（编程语言）
 * 输出：代码 + 说明
 */
function buildCoder(): WorkflowDefinition {
  return {
    nodes: [
      node('start_0', 'start', 0, 100, {
        title: L('开始', 'Start'),
        inputParams: [
          { name: 'requirement', label: L('需求描述', 'Requirement'), type: 'text' },
          { name: 'language', label: L('编程语言', 'Programming Language'), type: 'text' },
        ],
      }),
      node('llm_code', 'llm', 380, 60, {
        title: L('生成代码', 'Generate Code'),
        systemPrompt: L(
          '你是一位资深软件工程师，代码风格简洁规范。回答格式：先给出完整可运行的代码（用代码块包裹），再用 2-3 句话说明实现思路和使用方式。',
          'You are a senior software engineer who writes clean, idiomatic code. Format: complete runnable code in a code block first, then 2-3 sentences explaining the approach and usage.',
        ),
        prompt: L(
          '请用 {{input.language}} 实现以下需求：\n\n{{input.requirement}}',
          'Implement the following requirement in {{input.language}}:\n\n{{input.requirement}}',
        ),
      }),
      node('end_0', 'end', 760, 100, {
        title: L('结束', 'End'),
        outputParams: [{ name: 'code', label: L('生成代码', 'Generated Code'), expr: '{{nodes.llm_code.text}}' }],
      }),
    ],
    edges: [
      { sourceNodeID: 'start_0', targetNodeID: 'llm_code' },
      { sourceNodeID: 'llm_code', targetNodeID: 'end_0' },
    ],
  };
}

/**
 * 图文客服机器人：
 *   start(message, imageUrl?) → condition_branch(有无图片?)
 *     无图分支 → knowledge_answer → condition_branch(有无答案?) → end(答案) / end(无答案提示)
 *     有图分支 → ocr → llm(理解图文) → knowledge_answer → condition_branch(有无答案?) → end(答案) / end(转人工提示)
 *
 *   每条路径都以独立的 end 节点收尾，输出 { reply, source }。
 *   实际发送回复时，在 end 节点前加 notify 节点并配置 webhookUrl 即可。
 */
function buildImageQA(): WorkflowDefinition {
  const COL = [0, 340, 700, 1060, 1420];
  return {
    nodes: [
      // ── 开始
      node('start_0', 'start', COL[0], 260, {
        title: L('开始', 'Start'),
        inputParams: [
          { name: 'message', label: L('用户消息', 'User Message'), type: 'text' },
          { name: 'imageUrl', label: L('图片链接（可选）', 'Image URL (optional)'), type: 'text' },
        ],
      }),

      // ── 分支：是否有图片（imageUrl 非空 → 图片路径）
      node('branch_hasImg', 'condition_branch', COL[1], 260, {
        title: L('是否有图片', 'Has Image?'),
        branches: [
          { id: 'b0', name: L('无图片', 'No image'), condition: '{{input.imageUrl}} == ""' },
        ],
      }),

      // ────────────── 文字路径（无图） ──────────────
      node('ka_text', 'knowledge_answer', COL[2], 80, {
        title: L('知识库问答', 'Knowledge Q&A'),
        question: '{{input.message}}',
        topK: 5,
        scoreThreshold: 0.6,
      }),

      node('branch_textAns', 'condition_branch', COL[3], 80, {
        title: L('有答案？', 'Got answer?'),
        branches: [
          { id: 'b0', name: L('有答案', 'Has answer'), condition: '{{nodes.ka_text.answer}} != ""' },
        ],
      }),

      // 文字路径：回复答案
      node('msg_textAns', 'send_message', COL[4], 20, {
        title: L('发送答案', 'Send answer'),
        message: '{{nodes.ka_text.answer}}',
      }),
      node('end_textAns', 'end', COL[4] + 340, 20, {
        title: L('结束', 'End'),
      }),

      // 文字路径：无答案
      node('msg_textFallback', 'send_message', COL[4], 160, {
        title: L('发送：无答案', 'Send: no answer'),
        message: L('非常抱歉，暂时没有找到相关答案，请稍后再试。', 'Sorry, no relevant answer found. Please try again later.'),
      }),
      node('end_textFallback', 'end', COL[4] + 340, 160, {
        title: L('结束', 'End'),
      }),

      // ────────────── 图片路径（有图） ──────────────
      node('ocr_0', 'ocr', COL[2], 420, {
        title: L('图片文字识别', 'OCR'),
        imageUrl: '{{input.imageUrl}}',
      }),

      node('llm_imgUnderstand', 'llm', COL[3], 380, {
        title: L('图文理解', 'Image + Text Understanding'),
        systemPrompt: L(
          '你是一个智能客服助手。请综合理解用户的图片内容（OCR 提取）和文字消息，概括用户的核心问题，一句话输出。',
          'You are a smart customer-service assistant. Combine the OCR text from the image and the user message, then summarize the core question in one sentence.',
        ),
        prompt: L(
          '用户消息：{{input.message}}\n图片文字（OCR）：{{nodes.ocr_0.text}}\n\n请用一句话描述用户的核心问题：',
          'User message: {{input.message}}\nOCR text: {{nodes.ocr_0.text}}\n\nSummarize the user\'s core question in one sentence:',
        ),
      }),

      node('ka_img', 'knowledge_answer', COL[4] - 20, 380, {
        title: L('知识库问答（图文）', 'Knowledge Q&A (image)'),
        question: '{{nodes.llm_imgUnderstand.text}}',
        topK: 5,
        scoreThreshold: 0.6,
      }),

      node('branch_imgAns', 'condition_branch', COL[4] + 340, 380, {
        title: L('有答案？', 'Got answer?'),
        branches: [
          { id: 'b0', name: L('有答案', 'Has answer'), condition: '{{nodes.ka_img.answer}} != ""' },
        ],
      }),

      // 图片路径：回复答案
      node('msg_imgAns', 'send_message', COL[4] + 700, 310, {
        title: L('发送答案', 'Send answer'),
        message: '{{nodes.ka_img.answer}}',
      }),
      node('end_imgAns', 'end', COL[4] + 1040, 310, {
        title: L('结束', 'End'),
      }),

      // 图片路径：转人工
      node('msg_transfer', 'send_message', COL[4] + 700, 460, {
        title: L('发送：转人工', 'Send: transfer'),
        message: L('您的问题需要人工客服协助处理，正在为您转接，请稍候。', 'Your question requires a human agent. Transferring now, please wait.'),
      }),
      node('end_transfer', 'end', COL[4] + 1040, 460, {
        title: L('结束', 'End'),
      }),
    ],

    edges: [
      { sourceNodeID: 'start_0', targetNodeID: 'branch_hasImg' },

      // 无图 → 文字路径
      { sourceNodeID: 'branch_hasImg', targetNodeID: 'ka_text', sourcePortID: 'branch_0' },
      { sourceNodeID: 'ka_text', targetNodeID: 'branch_textAns' },
      { sourceNodeID: 'branch_textAns', targetNodeID: 'msg_textAns', sourcePortID: 'branch_0' },
      { sourceNodeID: 'branch_textAns', targetNodeID: 'msg_textFallback', sourcePortID: 'default' },
      { sourceNodeID: 'msg_textAns', targetNodeID: 'end_textAns' },
      { sourceNodeID: 'msg_textFallback', targetNodeID: 'end_textFallback' },

      // 有图 → 图片路径
      { sourceNodeID: 'branch_hasImg', targetNodeID: 'ocr_0', sourcePortID: 'default' },
      { sourceNodeID: 'ocr_0', targetNodeID: 'llm_imgUnderstand' },
      { sourceNodeID: 'llm_imgUnderstand', targetNodeID: 'ka_img' },
      { sourceNodeID: 'ka_img', targetNodeID: 'branch_imgAns' },
      { sourceNodeID: 'branch_imgAns', targetNodeID: 'msg_imgAns', sourcePortID: 'branch_0' },
      { sourceNodeID: 'branch_imgAns', targetNodeID: 'msg_transfer', sourcePortID: 'default' },
      { sourceNodeID: 'msg_imgAns', targetNodeID: 'end_imgAns' },
      { sourceNodeID: 'msg_transfer', targetNodeID: 'end_transfer' },
    ],
  };
}

export function getTemplates(): WorkflowTemplate[] {
  const t = (key: string) => i18n.t(key);
  return [
    {
      id: 'blank',
      icon: <Square size={16} />,
      name: t('templates.blank.name'),
      description: t('templates.blank.desc'),
      build: buildBlank,
    },
    {
      id: 'chatbot',
      icon: <Bot size={16} />,
      name: t('templates.chatbot.name'),
      description: t('templates.chatbot.desc'),
      build: buildChatbot,
    },
    {
      id: 'writer',
      icon: <PenLine size={16} />,
      name: t('templates.writer.name'),
      description: t('templates.writer.desc'),
      build: buildWriter,
    },
    {
      id: 'translator',
      icon: <Globe size={16} />,
      name: t('templates.translator.name'),
      description: t('templates.translator.desc'),
      build: buildTranslator,
    },
    {
      id: 'summarizer',
      icon: <FileText size={16} />,
      name: t('templates.summarizer.name'),
      description: t('templates.summarizer.desc'),
      build: buildSummarizer,
    },
    {
      id: 'coder',
      icon: <Code2 size={16} />,
      name: t('templates.coder.name'),
      description: t('templates.coder.desc'),
      build: buildCoder,
    },
    {
      id: 'image-qa',
      icon: <MessageSquare size={16} />,
      name: t('templates.imageQA.name'),
      description: t('templates.imageQA.desc'),
      build: buildImageQA,
    },
  ];
}
