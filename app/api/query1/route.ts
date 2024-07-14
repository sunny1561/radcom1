// app/api/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import { RetrievalQAChain } from "langchain/chains";
// import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
export async function POST(req: NextRequest) {
  // const searchParams = req.nextUrl.searchParams;
  const body = await req.json();
  const { question:query } = body;
  let chat_history=body.chat_history;
  console.log(chat_history);
  
  // const query = searchParams.get("query");
  // if (!query) {
  //   return NextResponse.json(
  //     { error: "please provide  query string" },
  //     { status: 401 }
  //   );
  // }
  if (!query) {
    return NextResponse.json(
      { error: "Please provide a question" },
      { status: 400 }
    );
  }
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  type Istreamdata = {
    message?: string;
    iaim?: boolean;
    sri?: boolean;
    pyq?: boolean;
    frd?: boolean;
    data?: string;
    token?: string;
  };
  const sendUpdate = async ({data,token}:Istreamdata) => {
    await writer.write(
      encoder.encode(`data: ${JSON.stringify({ data: data ,token:token})}\n\n`)
    );
  };

  const processQuery = async () => {
    try {
    //   await sendUpdate("Initializing AI models...");

      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const index_name = "langchain-rag-multiple-docs";
      const model = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY!,
        modelName: "text-embedding-ada-002",
      });

    //   await sendUpdate("Searching for relevant information...");

      const pineconeIndex = pinecone.Index(index_name);
      const vectorstore = await PineconeStore.fromExistingIndex(model, {
        pineconeIndex: pineconeIndex,
      });
      const retriever2 = ScoreThresholdRetriever.fromVectorStore(vectorstore, {
        minSimilarityScore: 0.8,
        maxK: 3,
        kIncrement: 2,
      });
    
      const results = await retriever2.invoke(query);

      // const results = await vectorstore.maxMarginalRelevanceSearch(query, {
      //   k: 3,
      //   fetchK: 20,
      // });

      const metadataArray = results.map((item) => item.metadata.file_name);
      const retriever = vectorstore.asRetriever();
    //   await sendUpdate("Processing your query...");

      const llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY!,
        temperature: 0.7,
        modelName: "gpt-3.5-turbo-0125",
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              sendUpdate({token});
            },
          },
        ],
      });

      const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`;

      const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
        ["system", contextualizeQSystemPrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{question}"],
      ]);
      const contextualizeQChain = contextualizeQPrompt
        .pipe(llm)
        .pipe(new StringOutputParser());

      const qaSystemPrompt = `You are an AI assistant specialized in answering questions about 3GPP telecom standards and technologies. You provide detailed and accurate information based on the 3GPP telecom dataset. If you are unsure about an answer or if the information is not available in the dataset, you should clearly state that you do not know.
      Use the following pieces of retrieved context to answer the question.
      If you don't know the answer, just say that you don't know.
      
      

      {context}`;

      const qaPrompt = ChatPromptTemplate.fromMessages([
        ["system", qaSystemPrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{question}"],
      ]);
      const contextualizedQuestion = (input: Record<string, unknown>) => {
        if ("chat_history" in input) {
          return contextualizeQChain;
        }
        return input.question;
      };
      const ragChain = RunnableSequence.from([
        RunnablePassthrough.assign({
          context: (input: Record<string, unknown>) => {
            if ("chat_history" in input) {
              const chain:any = contextualizedQuestion(input);
              return chain.pipe(retriever).pipe(formatDocumentsAsString);
            }
            return "";
          },
        }),
        qaPrompt,
        llm,
      ]);

      // const chain = RetrievalQAChain.fromLLM(llm, vectorstore.asRetriever());
      // await chain.call({ query });
      // let chat_history:any = [];
      // const question = "What is task decomposition?";
      const aiMsg = await ragChain.invoke({ question:query, chat_history });
      console.log(aiMsg);
      // // chat_history = chat_history.concat(aiMsg);

      // const secondQuestion = "What are common ways of doing it?";
      // await ragChain.invoke({ question: secondQuestion, chat_history });

    //   await sendUpdate("Fetching related diagrams...");
      if(!(aiMsg.content as string as string)){
        return new Response
      }
      const images = await getDiagramImages(aiMsg.content as string);

      await sendUpdate(
        {
            data:JSON.stringify({
                documents: metadataArray,
                imageData: images,
                done: true,
              })
        }
      );
    } catch (error) {
      console.error(error);
      await sendUpdate(
        {
            message:JSON.stringify({
                error: "An error occurred while processing your request.",
              })
        }
        )
      
    } finally {
      writer.close();
    }
  };

  processQuery();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function getDiagramImages(result: string) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const model = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
    modelName: "text-embedding-ada-002",
  });

  const index_name = "diagrams5g";
  const pineconeIndex = pinecone.Index(index_name);

  const vectorstore = await PineconeStore.fromExistingIndex(model, {
    pineconeIndex: pineconeIndex,
  });

  const retriever = ScoreThresholdRetriever.fromVectorStore(vectorstore, {
    minSimilarityScore: 0.75,
    maxK: 1,
    kIncrement: 2,
  });

  const docs = await retriever.invoke(result);
  return docs;
}
