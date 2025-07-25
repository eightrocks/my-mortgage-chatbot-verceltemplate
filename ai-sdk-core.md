[AI SDK](https://ai-sdk.dev/)

Search…
`⌘ K`

Feedback [GitHub](https://github.com/vercel/ai)

Sign in with Vercel

Sign in with Vercel

Menu

[AI SDK by Vercel](https://ai-sdk.dev/docs/introduction)

[AI SDK 5 Alpha](https://ai-sdk.dev/docs/announcing-ai-sdk-5-alpha)

[Foundations](https://ai-sdk.dev/docs/foundations)

[Overview](https://ai-sdk.dev/docs/foundations/overview)

[Providers and Models](https://ai-sdk.dev/docs/foundations/providers-and-models)

[Prompts](https://ai-sdk.dev/docs/foundations/prompts)

[Tools](https://ai-sdk.dev/docs/foundations/tools)

[Streaming](https://ai-sdk.dev/docs/foundations/streaming)

[Agents](https://ai-sdk.dev/docs/foundations/agents)

[Getting Started](https://ai-sdk.dev/docs/getting-started)

[Navigating the Library](https://ai-sdk.dev/docs/getting-started/navigating-the-library)

[Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)

[Next.js Pages Router](https://ai-sdk.dev/docs/getting-started/nextjs-pages-router)

[Svelte](https://ai-sdk.dev/docs/getting-started/svelte)

[Vue.js (Nuxt)](https://ai-sdk.dev/docs/getting-started/nuxt)

[Node.js](https://ai-sdk.dev/docs/getting-started/nodejs)

[Expo](https://ai-sdk.dev/docs/getting-started/expo)

[Guides](https://ai-sdk.dev/docs/guides)

[RAG Chatbot](https://ai-sdk.dev/docs/guides/rag-chatbot)

[Multi-Modal Chatbot](https://ai-sdk.dev/docs/guides/multi-modal-chatbot)

[Slackbot Guide](https://ai-sdk.dev/docs/guides/slackbot)

[Natural Language Postgres](https://ai-sdk.dev/docs/guides/natural-language-postgres)

[Get started with Computer Use](https://ai-sdk.dev/docs/guides/computer-use)

[Get started with Claude 4](https://ai-sdk.dev/docs/guides/claude-4)

[OpenAI Responses API](https://ai-sdk.dev/docs/guides/openai-responses)

[Get started with Claude 3.7 Sonnet](https://ai-sdk.dev/docs/guides/sonnet-3-7)

[Get started with Llama 3.1](https://ai-sdk.dev/docs/guides/llama-3_1)

[Get started with OpenAI GPT-4.5](https://ai-sdk.dev/docs/guides/gpt-4-5)

[Get started with OpenAI o1](https://ai-sdk.dev/docs/guides/o1)

[Get started with OpenAI o3-mini](https://ai-sdk.dev/docs/guides/o3)

[Get started with DeepSeek R1](https://ai-sdk.dev/docs/guides/r1)

[AI SDK Core](https://ai-sdk.dev/docs/ai-sdk-core)

[Overview](https://ai-sdk.dev/docs/ai-sdk-core/overview)

[Generating Text](https://ai-sdk.dev/docs/ai-sdk-core/generating-text)

[Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)

[Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

[Prompt Engineering](https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering)

[Settings](https://ai-sdk.dev/docs/ai-sdk-core/settings)

[Embeddings](https://ai-sdk.dev/docs/ai-sdk-core/embeddings)

[Image Generation](https://ai-sdk.dev/docs/ai-sdk-core/image-generation)

[Transcription](https://ai-sdk.dev/docs/ai-sdk-core/transcription)

[Speech](https://ai-sdk.dev/docs/ai-sdk-core/speech)

[Language Model Middleware](https://ai-sdk.dev/docs/ai-sdk-core/middleware)

[Provider & Model Management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management)

[Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)

[Testing](https://ai-sdk.dev/docs/ai-sdk-core/testing)

[Telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry)

[AI SDK UI](https://ai-sdk.dev/docs/ai-sdk-ui)

[Overview](https://ai-sdk.dev/docs/ai-sdk-ui/overview)

[Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)

[Chatbot Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence)

[Chatbot Tool Usage](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)

[Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)

[Completion](https://ai-sdk.dev/docs/ai-sdk-ui/completion)

[Object Generation](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation)

[OpenAI Assistants](https://ai-sdk.dev/docs/ai-sdk-ui/openai-assistants)

[Streaming Custom Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data)

[Error Handling](https://ai-sdk.dev/docs/ai-sdk-ui/error-handling)

[Smooth streaming japanese text](https://ai-sdk.dev/docs/ai-sdk-ui/smooth-stream-japanese)

[Smooth streaming chinese text](https://ai-sdk.dev/docs/ai-sdk-ui/smooth-stream-chinese)

[Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)

[AI SDK RSC](https://ai-sdk.dev/docs/ai-sdk-rsc)

[Advanced](https://ai-sdk.dev/docs/advanced)

[Reference](https://ai-sdk.dev/docs/reference)

[AI SDK Core](https://ai-sdk.dev/docs/reference/ai-sdk-core)

[AI SDK UI](https://ai-sdk.dev/docs/reference/ai-sdk-ui)

[AI SDK RSC](https://ai-sdk.dev/docs/reference/ai-sdk-rsc)

[Stream Helpers](https://ai-sdk.dev/docs/reference/stream-helpers)

[AI SDK Errors](https://ai-sdk.dev/docs/reference/ai-sdk-errors)

[Migration Guides](https://ai-sdk.dev/docs/migration-guides)

[Troubleshooting](https://ai-sdk.dev/docs/troubleshooting)

# [Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#tool-calling)

As covered under Foundations, [tools](https://ai-sdk.dev/docs/foundations/tools) are objects that can be called by the model to perform a specific task.
AI SDK Core tools contain three elements:

- **`description`**: An optional description of the tool that can influence when the tool is picked.
- **`parameters`**: A [Zod schema](https://ai-sdk.dev/docs/foundations/tools#schemas) or a [JSON schema](https://ai-sdk.dev/docs/reference/ai-sdk-core/json-schema) that defines the parameters. The schema is consumed by the LLM, and also used to validate the LLM tool calls.
- **`execute`**: An optional async function that is called with the arguments from the tool call. It produces a value of type `RESULT` (generic type). It is optional because you might want to forward tool calls to the client or to a queue instead of executing them in the same process.

You can use the [`tool`](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool) helper function to
infer the types of the `execute` parameters.

The `tools` parameter of `generateText` and `streamText` is an object that has the tool names as keys and the tools as values:

```code-block_code__y_sHJ

import { z } from 'zod';

import { generateText, tool } from 'ai';

const result = await generateText({

  model: yourModel,

  tools: {

    weather: tool({

      description: 'Get the weather in a location',

      parameters: z.object({

        location: z.string().describe('The location to get the weather for'),

      }),

      execute: async ({ location }) => ({

        location,

        temperature: 72 + Math.floor(Math.random() * 21) - 10,

      }),

    }),

  },

  prompt: 'What is the weather in San Francisco?',

});
```

When a model uses a tool, it is called a "tool call" and the output of the
tool is called a "tool result".

Tool calling is not restricted to only text generation.
You can also use it to render user interfaces (Generative UI).

## [Multi-Step Calls (using maxSteps)](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#multi-step-calls-using-maxsteps)

With the `maxSteps` setting, you can enable multi-step calls in `generateText` and `streamText`. When `maxSteps` is set to a number greater than 1 and the model generates a tool call, the AI SDK will trigger a new generation passing in the tool result until there
are no further tool calls or the maximum number of tool steps is reached.

To decide what value to set for `maxSteps`, consider the most complex task the
call might handle and the number of sequential steps required for completion,
rather than just the number of available tools.

By default, when you use `generateText` or `streamText`, it triggers a single generation ( `maxSteps: 1`). This works well for many use cases where you can rely on the model's training data to generate a response. However, when you provide tools, the model now has the choice to either generate a normal text response, or generate a tool call. If the model generates a tool call, it's generation is complete and that step is finished.

You may want the model to generate text after the tool has been executed, either to summarize the tool results in the context of the users query. In many cases, you may also want the model to use multiple tools in a single response. This is where multi-step calls come in.

You can think of multi-step calls in a similar way to a conversation with a human. When you ask a question, if the person does not have the requisite knowledge in their common knowledge (a model's training data), the person may need to look up information (use a tool) before they can provide you with an answer. In the same way, the model may need to call a tool to get the information it needs to answer your question where each generation (tool call or text generation) is a step.

### [Example](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#example)

In the following example, there are two steps:

1. **Step 1**
1. The prompt `'What is the weather in San Francisco?'` is sent to the model.
2. The model generates a tool call.
3. The tool call is executed.
2. **Step 2**
1. The tool result is sent to the model.
2. The model generates a response considering the tool result.

```code-block_code__y_sHJ

import { z } from 'zod';

import { generateText, tool } from 'ai';

const { text, steps } = await generateText({

  model: yourModel,

  tools: {

    weather: tool({

      description: 'Get the weather in a location',

      parameters: z.object({

        location: z.string().describe('The location to get the weather for'),

      }),

      execute: async ({ location }) => ({

        location,

        temperature: 72 + Math.floor(Math.random() * 21) - 10,

      }),

    }),

  },

  maxSteps: 5, // allow up to 5 steps

  prompt: 'What is the weather in San Francisco?',

});
```

You can use `streamText` in a similar way.

### [Steps](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#steps)

To access intermediate tool calls and results, you can use the `steps` property in the result object
or the `streamText` `onFinish` callback.
It contains all the text, tool calls, tool results, and more from each step.

#### [Example: Extract tool results from all steps](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#example-extract-tool-results-from-all-steps)

```code-block_code__y_sHJ

import { generateText } from 'ai';

const { steps } = await generateText({

  model: openai('gpt-4-turbo'),

  maxSteps: 10,

  // ...

});

// extract all tool calls from the steps:

const allToolCalls = steps.flatMap(step => step.toolCalls);
```

### [`onStepFinish` callback](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#onstepfinish-callback)

When using `generateText` or `streamText`, you can provide an `onStepFinish` callback that
is triggered when a step is finished,
i.e. all text deltas, tool calls, and tool results for the step are available.
When you have multiple steps, the callback is triggered for each step.

```code-block_code__y_sHJ

import { generateText } from 'ai';

const result = await generateText({

  // ...

  onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {

    // your own logic, e.g. for saving the chat history or recording usage

  },

});
```

### [`experimental_prepareStep` callback](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#experimental_preparestep-callback)

The `experimental_prepareStep` callback is experimental and may change in the
future. It is only available in the `generateText` function.

The `experimental_prepareStep` callback is called before a step is started.

It is called with the following parameters:

- `model`: The model that was passed into `generateText`.
- `maxSteps`: The maximum number of steps that was passed into `generateText`.
- `stepNumber`: The number of the step that is being executed.
- `steps`: The steps that have been executed so far.

You can use it to provide different settings for a step.

```code-block_code__y_sHJ

import { generateText } from 'ai';

const result = await generateText({

  // ...

  experimental_prepareStep: async ({ model, stepNumber, maxSteps, steps }) => {

    if (stepNumber === 0) {

      return {

        // use a different model for this step:

        model: modelForThisParticularStep,

        // force a tool choice for this step:

        toolChoice: { type: 'tool', toolName: 'tool1' },

        // limit the tools that are available for this step:

        experimental_activeTools: ['tool1'],

      };

    }

    // when nothing is returned, the default settings are used

  },

});
```

## [Response Messages](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#response-messages)

Adding the generated assistant and tool messages to your conversation history is a common task,
especially if you are using multi-step tool calls.

Both `generateText` and `streamText` have a `response.messages` property that you can use to
add the assistant and tool messages to your conversation history.
It is also available in the `onFinish` callback of `streamText`.

The `response.messages` property contains an array of `CoreMessage` objects that you can add to your conversation history:

```code-block_code__y_sHJ

import { generateText } from 'ai';

const messages: CoreMessage[] = [\
\
  // ...\
\
];

const { response } = await generateText({

  // ...

  messages,

});

// add the response messages to your conversation history:

messages.push(...response.messages); // streamText: ...((await response).messages)
```

## [Tool Choice](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#tool-choice)

You can use the `toolChoice` setting to influence when a tool is selected.
It supports the following settings:

- `auto` (default): the model can choose whether and which tools to call.
- `required`: the model must call a tool. It can choose which tool to call.
- `none`: the model must not call tools
- `{ type: 'tool', toolName: string (typed) }`: the model must call the specified tool

```code-block_code__y_sHJ

import { z } from 'zod';

import { generateText, tool } from 'ai';

const result = await generateText({

  model: yourModel,

  tools: {

    weather: tool({

      description: 'Get the weather in a location',

      parameters: z.object({

        location: z.string().describe('The location to get the weather for'),

      }),

      execute: async ({ location }) => ({

        location,

        temperature: 72 + Math.floor(Math.random() * 21) - 10,

      }),

    }),

  },

  toolChoice: 'required', // force the model to call a tool

  prompt: 'What is the weather in San Francisco?',

});
```

## [Tool Execution Options](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#tool-execution-options)

When tools are called, they receive additional options as a second parameter.

### [Tool Call ID](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#tool-call-id)

The ID of the tool call is forwarded to the tool execution.
You can use it e.g. when sending tool-call related information with stream data.

```code-block_code__y_sHJ

import { StreamData, streamText, tool } from 'ai';

export async function POST(req: Request) {

  const { messages } = await req.json();

  const data = new StreamData();

  const result = streamText({

    // ...

    messages,

    tools: {

      myTool: tool({

        // ...

        execute: async (args, { toolCallId }) => {

          // return e.g. custom status for tool call

          data.appendMessageAnnotation({

            type: 'tool-status',

            toolCallId,

            status: 'in-progress',

          });

          // ...

        },

      }),

    },

    onFinish() {

      data.close();

    },

  });

  return result.toDataStreamResponse({ data });

}
```

### [Messages](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#messages)

The messages that were sent to the language model to initiate the response that contained the tool call are forwarded to the tool execution.
You can access them in the second parameter of the `execute` function.
In multi-step calls, the messages contain the text, tool calls, and tool results from all previous steps.

```code-block_code__y_sHJ

import { generateText, tool } from 'ai';

const result = await generateText({

  // ...

  tools: {

    myTool: tool({

      // ...

      execute: async (args, { messages }) => {

        // use the message history in e.g. calls to other language models

        return something;

      },

    }),

  },

});
```

### [Abort Signals](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#abort-signals)

The abort signals from `generateText` and `streamText` are forwarded to the tool execution.
You can access them in the second parameter of the `execute` function and e.g. abort long-running computations or forward them to fetch calls inside tools.

```code-block_code__y_sHJ

import { z } from 'zod';

import { generateText, tool } from 'ai';

const result = await generateText({

  model: yourModel,

  abortSignal: myAbortSignal, // signal that will be forwarded to tools

  tools: {

    weather: tool({

      description: 'Get the weather in a location',

      parameters: z.object({ location: z.string() }),

      execute: async ({ location }, { abortSignal }) => {

        return fetch(

          `https://api.weatherapi.com/v1/current.json?q=${location}`,

          { signal: abortSignal }, // forward the abort signal to fetch

        );

      },

    }),

  },

  prompt: 'What is the weather in San Francisco?',

});
```

## [Types](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#types)

Modularizing your code often requires defining types to ensure type safety and reusability.
To enable this, the AI SDK provides several helper types for tools, tool calls, and tool results.

You can use them to strongly type your variables, function parameters, and return types
in parts of the code that are not directly related to `streamText` or `generateText`.

Each tool call is typed with `ToolCall<NAME extends string, ARGS>`, depending
on the tool that has been invoked.
Similarly, the tool results are typed with `ToolResult<NAME extends string, ARGS, RESULT>`.

The tools in `streamText` and `generateText` are defined as a `ToolSet`.
The type inference helpers `ToolCallUnion<TOOLS extends ToolSet>`
and `ToolResultUnion<TOOLS extends ToolSet>` can be used to
extract the tool call and tool result types from the tools.

```code-block_code__y_sHJ

import { openai } from '@ai-sdk/openai';

import { ToolCallUnion, ToolResultUnion, generateText, tool } from 'ai';

import { z } from 'zod';

const myToolSet = {

  firstTool: tool({

    description: 'Greets the user',

    parameters: z.object({ name: z.string() }),

    execute: async ({ name }) => `Hello, ${name}!`,

  }),

  secondTool: tool({

    description: 'Tells the user their age',

    parameters: z.object({ age: z.number() }),

    execute: async ({ age }) => `You are ${age} years old!`,

  }),

};

type MyToolCall = ToolCallUnion<typeof myToolSet>;

type MyToolResult = ToolResultUnion<typeof myToolSet>;

async function generateSomething(prompt: string): Promise<{

  text: string;

  toolCalls: Array<MyToolCall>; // typed tool calls

  toolResults: Array<MyToolResult>; // typed tool results

}> {

  return generateText({

    model: openai('gpt-4o'),

    tools: myToolSet,

    prompt,

  });

}
```

## [Handling Errors](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#handling-errors)

The AI SDK has three tool-call related errors:

- [`NoSuchToolError`](https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-such-tool-error): the model tries to call a tool that is not defined in the tools object
- [`InvalidToolArgumentsError`](https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-tool-arguments-error): the model calls a tool with arguments that do not match the tool's parameters
- [`ToolExecutionError`](https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-tool-execution-error): an error that occurred during tool execution
- [`ToolCallRepairError`](https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-tool-call-repair-error): an error that occurred during tool call repair

### [`generateText`](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#generatetext)

`generateText` throws errors and can be handled using a `try`/ `catch` block:

```code-block_code__y_sHJ

try {

  const result = await generateText({

    //...

  });

} catch (error) {

  if (NoSuchToolError.isInstance(error)) {

    // handle the no such tool error

  } else if (InvalidToolArgumentsError.isInstance(error)) {

    // handle the invalid tool arguments error

  } else if (ToolExecutionError.isInstance(error)) {

    // handle the tool execution error

  } else {

    // handle other errors

  }

}
```

### [`streamText`](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#streamtext)

`streamText` sends the errors as part of the full stream. The error parts contain the error object.

When using `toDataStreamResponse`, you can pass an `getErrorMessage` function to extract the error message from the error part and forward it as part of the data stream response:

```code-block_code__y_sHJ

const result = streamText({

  // ...

});

return result.toDataStreamResponse({

  getErrorMessage: error => {

    if (NoSuchToolError.isInstance(error)) {

      return 'The model tried to call a unknown tool.';

    } else if (InvalidToolArgumentsError.isInstance(error)) {

      return 'The model called a tool with invalid arguments.';

    } else if (ToolExecutionError.isInstance(error)) {

      return 'An error occurred during tool execution.';

    } else {

      return 'An unknown error occurred.';

    }

  },

});
```

## [Tool Call Repair](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#tool-call-repair)

The tool call repair feature is experimental and may change in the future.

Language models sometimes fail to generate valid tool calls,
especially when the parameters are complex or the model is smaller.

You can use the `experimental_repairToolCall` function to attempt to repair the tool call
with a custom function.

You can use different strategies to repair the tool call:

- Use a model with structured outputs to generate the arguments.
- Send the messages, system prompt, and tool schema to a stronger model to generate the arguments.
- Provide more specific repair instructions based on which tool was called.

### [Example: Use a model with structured outputs for repair](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#example-use-a-model-with-structured-outputs-for-repair)

```code-block_code__y_sHJ

import { openai } from '@ai-sdk/openai';

import { generateObject, generateText, NoSuchToolError, tool } from 'ai';

const result = await generateText({

  model,

  tools,

  prompt,

  experimental_repairToolCall: async ({

    toolCall,

    tools,

    parameterSchema,

    error,

  }) => {

    if (NoSuchToolError.isInstance(error)) {

      return null; // do not attempt to fix invalid tool names

    }

    const tool = tools[toolCall.toolName as keyof typeof tools];

    const { object: repairedArgs } = await generateObject({

      model: openai('gpt-4o', { structuredOutputs: true }),

      schema: tool.parameters,

      prompt: [\
\
        `The model tried to call the tool "${toolCall.toolName}"` +\
\
          ` with the following arguments:`,\
\
        JSON.stringify(toolCall.args),\
\
        `The tool accepts the following schema:`,\
\
        JSON.stringify(parameterSchema(toolCall)),\
\
        'Please fix the arguments.',\
\
      ].join('\n'),

    });

    return { ...toolCall, args: JSON.stringify(repairedArgs) };

  },

});
```

### [Example: Use the re-ask strategy for repair](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#example-use-the-re-ask-strategy-for-repair)

```code-block_code__y_sHJ

import { openai } from '@ai-sdk/openai';

import { generateObject, generateText, NoSuchToolError, tool } from 'ai';

const result = await generateText({

  model,

  tools,

  prompt,

  experimental_repairToolCall: async ({

    toolCall,

    tools,

    error,

    messages,

    system,

  }) => {

    const result = await generateText({

      model,

      system,

      messages: [\
\
        ...messages,\
\
        {\
\
          role: 'assistant',\
\
          content: [\
\
            {\
\
              type: 'tool-call',\
\
              toolCallId: toolCall.toolCallId,\
\
              toolName: toolCall.toolName,\
\
              args: toolCall.args,\
\
            },\
\
          ],\
\
        },\
\
        {\
\
          role: 'tool' as const,\
\
          content: [\
\
            {\
\
              type: 'tool-result',\
\
              toolCallId: toolCall.toolCallId,\
\
              toolName: toolCall.toolName,\
\
              result: error.message,\
\
            },\
\
          ],\
\
        },\
\
      ],

      tools,

    });

    const newToolCall = result.toolCalls.find(

      newToolCall => newToolCall.toolName === toolCall.toolName,

    );

    return newToolCall != null

      ? {

          toolCallType: 'function' as const,

          toolCallId: toolCall.toolCallId,

          toolName: toolCall.toolName,

          args: JSON.stringify(newToolCall.args),

        }

      : null;

  },

});
```

## [Active Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#active-tools)

The `activeTools` property is experimental and may change in the future.

Language models can only handle a limited number of tools at a time, depending on the model.
To allow for static typing using a large number of tools and limiting the available tools to the model at the same time,
the AI SDK provides the `experimental_activeTools` property.

It is an array of tool names that are currently active.
By default, the value is `undefined` and all tools are active.

```code-block_code__y_sHJ

import { openai } from '@ai-sdk/openai';

import { generateText } from 'ai';

const { text } = await generateText({

  model: openai('gpt-4o'),

  tools: myToolSet,

  experimental_activeTools: ['firstTool'],

});
```

## [Multi-modal Tool Results](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#multi-modal-tool-results)

Multi-modal tool results are experimental and only supported by Anthropic.

In order to send multi-modal tool results, e.g. screenshots, back to the model,
they need to be converted into a specific format.

AI SDK Core tools have an optional `experimental_toToolResultContent` function
that converts the tool result into a content part.

Here is an example for converting a screenshot into a content part:

```code-block_code__y_sHJ

const result = await generateText({

  model: anthropic('claude-3-5-sonnet-20241022'),

  tools: {

    computer: anthropic.tools.computer_20241022({

      // ...

      async execute({ action, coordinate, text }) {

        switch (action) {

          case 'screenshot': {

            return {

              type: 'image',

              data: fs

                .readFileSync('./data/screenshot-editor.png')

                .toString('base64'),

            };

          }

          default: {

            return `executed ${action}`;

          }

        }

      },

      // map to tool result content for LLM consumption:

      experimental_toToolResultContent(result) {

        return typeof result === 'string'

          ? [{ type: 'text', text: result }]

          : [{ type: 'image', data: result.data, mimeType: 'image/png' }];

      },

    }),

  },

  // ...

});
```

## [Extracting Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#extracting-tools)

Once you start having many tools, you might want to extract them into separate files.
The `tool` helper function is crucial for this, because it ensures correct type inference.

Here is an example of an extracted tool:

tools/weather-tool.ts

```code-block_code__y_sHJ

import { tool } from 'ai';

import { z } from 'zod';

// the `tool` helper function ensures correct type inference:

export const weatherTool = tool({

  description: 'Get the weather in a location',

  parameters: z.object({

    location: z.string().describe('The location to get the weather for'),

  }),

  execute: async ({ location }) => ({

    location,

    temperature: 72 + Math.floor(Math.random() * 21) - 10,

  }),

});
```

## [MCP Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#mcp-tools)

The MCP tools feature is experimental and may change in the future.

The AI SDK supports connecting to [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers to access their tools.
This enables your AI applications to discover and use tools across various services through a standardized interface.

### [Initializing an MCP Client](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#initializing-an-mcp-client)

Create an MCP client using either:

- `SSE` (Server-Sent Events): Uses HTTP-based real-time communication, better suited for remote servers that need to send data over the network
- `stdio`: Uses standard input and output streams for communication, ideal for local tool servers running on the same machine (like CLI tools or local services)
- Custom transport: Bring your own transport by implementing the `MCPTransport` interface, ideal when implementing transports from MCP's official Typescript SDK (e.g. `StreamableHTTPClientTransport`)

#### [SSE Transport](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#sse-transport)

The SSE can be configured using a simple object with a `type` and `url` property:

```code-block_code__y_sHJ

import { experimental_createMCPClient as createMCPClient } from 'ai';

const mcpClient = await createMCPClient({

  transport: {

    type: 'sse',

    url: 'https://my-server.com/sse',

    // optional: configure HTTP headers, e.g. for authentication

    headers: {

      Authorization: 'Bearer my-api-key',

    },

  },

});
```

#### [Stdio Transport](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#stdio-transport)

The Stdio transport requires importing the `StdioMCPTransport` class from the `ai/mcp-stdio` package:

```code-block_code__y_sHJ

import { experimental_createMCPClient as createMCPClient } from 'ai';

import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';

const mcpClient = await createMCPClient({

  transport: new StdioMCPTransport({

    command: 'node',

    args: ['src/stdio/dist/server.js'],

  }),

});
```

#### [Custom Transport](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#custom-transport)

You can also bring your own transport, as long as it implements the `MCPTransport` interface. Below is an example of using the new `StreamableHTTPClientTransport` from MCP's official Typescript SDK:

```code-block_code__y_sHJ

import {

  MCPTransport,

  experimental_createMCPClient as createMCPClient,

} from 'ai';

import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';

const url = new URL('http://localhost:3000/mcp');

const mcpClient = await createMCPClient({

  transport: new StreamableHTTPClientTransport(url, {

    sessionId: 'session_123',

  }),

});
```

The client returned by the `experimental_createMCPClient` function is a
lightweight client intended for use in tool conversion. It currently does not
support all features of the full MCP client, such as: authorization, session
management, resumable streams, and receiving notifications.

#### [Closing the MCP Client](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#closing-the-mcp-client)

After initialization, you should close the MCP client based on your usage pattern:

- For short-lived usage (e.g., single requests), close the client when the response is finished
- For long-running clients (e.g., command line apps), keep the client open but ensure it's closed when the application terminates

When streaming responses, you can close the client when the LLM response has finished. For example, when using `streamText`, you should use the `onFinish` callback:

```code-block_code__y_sHJ

const mcpClient = await experimental_createMCPClient({

  // ...

});

const tools = await mcpClient.tools();

const result = await streamText({

  model: openai('gpt-4o'),

  tools,

  prompt: 'What is the weather in Brooklyn, New York?',

  onFinish: async () => {

    await mcpClient.close();

  },

});
```

When generating responses without streaming, you can use try/finally or cleanup functions in your framework:

```code-block_code__y_sHJ

let mcpClient: MCPClient | undefined;

try {

  mcpClient = await experimental_createMCPClient({

    // ...

  });

} finally {

  await mcpClient?.close();

}
```

### [Using MCP Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#using-mcp-tools)

The client's `tools` method acts as an adapter between MCP tools and AI SDK tools. It supports two approaches for working with tool schemas:

#### [Schema Discovery](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#schema-discovery)

The simplest approach where all tools offered by the server are listed, and input parameter types are inferred based the schemas provided by the server:

```code-block_code__y_sHJ

const tools = await mcpClient.tools();
```

**Pros:**

- Simpler to implement
- Automatically stays in sync with server changes

**Cons:**

- No TypeScript type safety during development
- No IDE autocompletion for tool parameters
- Errors only surface at runtime
- Loads all tools from the server

#### [Schema Definition](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#schema-definition)

You can also define the tools and their input schemas explicitly in your client code:

```code-block_code__y_sHJ

import { z } from 'zod';

const tools = await mcpClient.tools({

  schemas: {

    'get-data': {

      parameters: z.object({

        query: z.string().describe('The data query'),

        format: z.enum(['json', 'text']).optional(),

      }),

    },

    // For tools with zero arguments, you should use an empty object:

    'tool-with-no-args': {

      parameters: z.object({}),

    },

  },

});
```

**Pros:**

- Control over which tools are loaded
- Full TypeScript type safety
- Better IDE support with autocompletion
- Catch parameter mismatches during development

**Cons:**

- Need to manually keep schemas in sync with server
- More code to maintain

When you define `schemas`, the client will only pull the explicitly defined tools, even if the server offers additional tools. This can be beneficial for:

- Keeping your application focused on the tools it needs
- Reducing unnecessary tool loading
- Making your tool dependencies explicit

## [Examples](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\#examples)

You can see tools in action using various frameworks in the following examples:

[Learn to use tools in Node.js](https://ai-sdk.dev/cookbook/node/call-tools) [Learn to use tools in Next.js with Route Handlers](https://ai-sdk.dev/cookbook/next/call-tools) [Learn to use MCP tools in Node.js](https://ai-sdk.dev/cookbook/node/mcp-tools)

On this page

[Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#tool-calling)

[Multi-Step Calls (using maxSteps)](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls-using-maxsteps)

[Example](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#example)

[Steps](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#steps)

[Example: Extract tool results from all steps](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#example-extract-tool-results-from-all-steps)

[onStepFinish callback](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#onstepfinish-callback)

[experimental\_prepareStep callback](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#experimental_preparestep-callback)

[Response Messages](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#response-messages)

[Tool Choice](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#tool-choice)

[Tool Execution Options](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#tool-execution-options)

[Tool Call ID](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#tool-call-id)

[Messages](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#messages)

[Abort Signals](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#abort-signals)

[Types](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#types)

[Handling Errors](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#handling-errors)

[generateText](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#generatetext)

[streamText](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#streamtext)

[Tool Call Repair](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#tool-call-repair)

[Example: Use a model with structured outputs for repair](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#example-use-a-model-with-structured-outputs-for-repair)

[Example: Use the re-ask strategy for repair](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#example-use-the-re-ask-strategy-for-repair)

[Active Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#active-tools)

[Multi-modal Tool Results](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-modal-tool-results)

[Extracting Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#extracting-tools)

[MCP Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#mcp-tools)

[Initializing an MCP Client](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#initializing-an-mcp-client)

[SSE Transport](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#sse-transport)

[Stdio Transport](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#stdio-transport)

[Custom Transport](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#custom-transport)

[Closing the MCP Client](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#closing-the-mcp-client)

[Using MCP Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#using-mcp-tools)

[Schema Discovery](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#schema-discovery)

[Schema Definition](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#schema-definition)

[Examples](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#examples)

Elevate your AI applications with Vercel.

Trusted by OpenAI, Replicate, Suno, Pinecone, and more.

Vercel provides tools and infrastructure to deploy AI apps and features at scale.

[Talk to an expert](https://vercel.com/contact/sales?utm_source=ai_sdk&utm_medium=web&utm_campaign=contact_sales_cta&utm_content=talk_to_an_expert_sdk_docs)