import os
from textwrap import dedent

from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI


def build_pricelens_crew():
    """Construct the optimized PriceLens AI crew (Faster: 2 Agents)."""

    # Load environment variables
    load_dotenv()

    # Ensure API Key is available
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        raise ValueError(
            "OPENAI_API_KEY is required. Set it in your environment or a local .env file."
        )

    # Shared LLM
    model_name = os.getenv("OPENAI_MODEL_NAME", "gpt-4o-mini")
    llm = ChatOpenAI(model=model_name, temperature=0.2)

    # 🧠 AGENT 1 — MARKET ANALYST (Combined Signal + WTP)
    market_analyst = Agent(
        role="Market & Pricing Analyst",
        goal="Extract signals and analyze willingness-to-pay in one step",
        backstory=(
            "You are an expert at analyzing customer interviews to extract economic "
            "signals and infer pricing power, willingness-to-pay, and customer "
            "segmentation immediately."
        ),
        verbose=True,
        llm=llm,
        allow_delegation=False,
    )

    analysis_task = Task(
        description=dedent(
            """
            Analyze the provided customer interview transcript.
            
            1. EXTRACT SIGNALS:
               - Alternatives used & prices paid
               - Pain intensity & value drivers
               - Specific price mentions ("expensive", "fair", "cheap")
               
            2. INFER ECONOMICS (WTP):
               - Estimate Willingness-to-Pay (WTP) ranges
               - Identify price sensitivity
               - Determine if the product is a "Painkiller" (Mission Critical) or "Vitamin" (Nice-to-have)
            
            Output:
            - Key Signals (bullet points)
            - WTP Code Analysis (Ranges, Segments, Confidence)
            """
        ).strip(),
        expected_output="Combined signal extraction and willingness-to-pay analysis.",
        agent=market_analyst,
        context_variables=["transcript"],
    )

    # 🧠 AGENT 2 — LEAD STRATEGIST (Combined Strategy + Risk + Validation)
    strategist = Agent(
        role="Lead Pricing Strategist",
        goal="Develop pricing strategy, assess risks, and plan validation",
        backstory=(
            "You are a seasoned pricing lead. You take raw market analysis and "
            "productionize it into a launch price, risk assessment, and validation plan "
            "in a single comprehensive report."
        ),
        verbose=True,
        llm=llm,
        allow_delegation=False,
    )

    strategy_task = Task(
        description=dedent(
            """
            Based on the Market Analysis, produce a final Pricing Strategy Report.
            
            1. RECOMMENDATION:
               - Set a specific Launch Price (or narrow range)
               - Define the Target Segment
               - Justify with evidence from the analysis
               
            2. RISK ASSESSMENT:
               - Confidence Score (0-100)
               - Key risks (Overpricing vs Underpricing)
               
            3. VALIDATION PLAN:
               - Next immediate step to test this price (e.g., Pre-orders, Landing Page test)
            
            Output:
            - Final Strategy with Price, Rationale, Risks, and Validation Steps.
            """
        ).strip(),
        expected_output="Comprehensive pricing recommendation, risk check, and validation plan.",
        agent=strategist,
        context_variables=["analysis_task_output", "product_type", "stage"],
    )

    crew = Crew(
        agents=[
            market_analyst,
            strategist,
        ],
        tasks=[
            analysis_task,
            strategy_task,
        ],
        process=Process.sequential,
        verbose=True,
    )

    return crew


def run_pricelens_pipeline(transcript_text: str, product_type: str = "SaaS", stage: str = "Pre-revenue"):
    """Run the optimized PriceLens AI pipeline."""
    crew = build_pricelens_crew()
    result = crew.kickoff(
        inputs={
            "transcript": transcript_text,
            "product_type": product_type,
            "stage": stage,
        }
    )
    return result


if __name__ == "__main__":
    sample_transcript = "Founder says they pay $50/mo for a competitor but hate it."
    print("Running Optimized Pipeline...\n")
    output = run_pricelens_pipeline(sample_transcript)
    print("\n=== FINAL OUTPUT ===\n")
    print(output)
