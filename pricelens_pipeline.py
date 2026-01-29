import os
import logging
from textwrap import dedent
from typing import Dict, Any

from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def build_pricelens_crew():
    """
    Construct the enhanced PriceLens AI crew with specialized agents.
    
    Architecture:
    - Market Analyst: Extracts signals and analyzes willingness-to-pay
    - Pricing Strategist: Develops strategy, assesses risks, plans validation
    
    Returns:
        Crew: Configured CrewAI crew instance
    """
    # Load environment variables
    load_dotenv()

    # Ensure API Key is available
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        raise ValueError(
            "OPENAI_API_KEY is required. Set it in your environment or a local .env file."
        )

    # Configure LLM with optimized settings
    model_name = os.getenv("OPENAI_MODEL_NAME", "gpt-4o-mini")
    temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.2"))
    
    llm = ChatOpenAI(
        model=model_name,
        temperature=temperature,
        max_tokens=4000,
    )
    
    logger.info(f"🤖 Using model: {model_name} (temperature: {temperature})")

    # 🧠 AGENT 1 — MARKET ANALYST (Signal Extraction + WTP Analysis)
    market_analyst = Agent(
        role="Senior Market & Pricing Analyst",
        goal=(
            "Extract all pricing signals, willingness-to-pay indicators, and market "
            "dynamics from customer interviews with precision and depth."
        ),
        backstory=dedent(
            """
            You are a world-class pricing analyst with 15+ years of experience analyzing 
            customer behavior and market dynamics. You've worked with Fortune 500 companies 
            and startups alike, helping them understand their pricing power. You have an 
            exceptional ability to read between the lines in customer interviews, identifying 
            subtle signals that others miss. You combine quantitative analysis with qualitative 
            insights to build a complete picture of customer willingness-to-pay.
            
            Your expertise includes:
            - Behavioral economics and price psychology
            - Customer segmentation and persona development
            - Competitive pricing analysis
            - Value-based pricing methodologies
            - B2B and B2C pricing strategies
            """
        ).strip(),
        verbose=True,
        llm=llm,
        allow_delegation=False,
        max_iter=3,
        max_execution_time=300,
    )

    analysis_task = Task(
        description=dedent(
            """
            Conduct a comprehensive analysis of the customer interview transcript provided.
            
            Your analysis must include:
            
            ## 1. SIGNAL EXTRACTION
            
            Extract and categorize all pricing-related signals:
            
            **Competitive Intelligence:**
            - Current alternatives/solutions the customer uses
            - Prices paid for alternatives (exact amounts if mentioned)
            - Satisfaction level with current solutions
            - Switching costs and barriers mentioned
            
            **Value Indicators:**
            - Pain points and their intensity (rate 1-10)
            - Value drivers and desired outcomes
            - Time/money costs of current problems
            - ROI expectations or mentions
            
            **Price Sensitivity Signals:**
            - Direct price mentions ("expensive", "affordable", "worth it", etc.)
            - Budget constraints or mentions
            - Decision-making authority indicators
            - Urgency indicators
            
            ## 2. WILLINGNESS-TO-PAY (WTP) ANALYSIS
            
            Based on the signals extracted, provide:
            
            **WTP Estimation:**
            - Primary WTP range (low-high) with confidence level
            - Secondary WTP range if multiple segments identified
            - Rationale for each range based on specific transcript evidence
            
            **Customer Segmentation:**
            - Identify distinct customer segments (if applicable)
            - WTP by segment
            - Segment characteristics and size indicators
            
            **Product Classification:**
            - Classify as "Painkiller" (mission-critical) or "Vitamin" (nice-to-have)
            - Justify classification with evidence
            - Impact on pricing power
            
            **Confidence Assessment:**
            - Rate confidence in WTP estimate (0-100%)
            - List factors increasing confidence
            - List factors decreasing confidence or creating uncertainty
            
            ## 3. MARKET DYNAMICS
            
            Identify:
            - Market positioning opportunities
            - Competitive advantages mentioned
            - Potential pricing objections
            - Upsell/cross-sell opportunities
            
            ## OUTPUT FORMAT
            
            Structure your analysis as clear, well-organized markdown with:
            - Headers and subheaders
            - Bullet points for key findings
            - Specific quotes from transcript (in italics)
            - Data points highlighted (prices, percentages, etc.)
            - Clear confidence indicators
            
            Be thorough, specific, and evidence-based. Every claim should be backed by 
            something from the transcript.
            """
        ).strip(),
        expected_output=(
            "A comprehensive markdown report with signal extraction, WTP analysis, "
            "customer segmentation, and market dynamics. The report should be detailed, "
            "evidence-based, and actionable."
        ),
        agent=market_analyst,
        context_variables=["transcript"],
    )

    # 🧠 AGENT 2 — LEAD STRATEGIST (Strategy + Risk + Validation)
    strategist = Agent(
        role="Chief Pricing Strategist",
        goal=(
            "Transform market analysis into actionable pricing strategy with clear "
            "recommendations, risk assessment, and validation roadmap."
        ),
        backstory=dedent(
            """
            You are a Chief Pricing Officer with 20+ years of experience building pricing 
            strategies for companies ranging from pre-revenue startups to billion-dollar 
            enterprises. You've launched hundreds of products and pricing models, learning 
            what works and what doesn't. You're known for your ability to balance ambition 
            with pragmatism, creating pricing strategies that maximize revenue while 
            minimizing risk.
            
            Your track record includes:
            - Launching pricing for 50+ SaaS products
            - Designing pricing models that increased ARR by 200%+
            - Building pricing functions from scratch
            - Training pricing teams at top tech companies
            
            You understand that pricing is both art and science, and you excel at 
            translating customer insights into winning pricing strategies.
            """
        ).strip(),
        verbose=True,
        llm=llm,
        allow_delegation=False,
        max_iter=3,
        max_execution_time=300,
    )

    strategy_task = Task(
        description=dedent(
            """
            Using the Market Analysis provided, create a comprehensive Pricing Strategy Report.
            
            Consider the product type: {product_type}
            Consider the business stage: {stage}
            
            Your report must include:
            
            ## 1. PRICING RECOMMENDATION
            
            **Launch Price:**
            - Specific recommended price (or narrow range if uncertainty exists)
            - Pricing model recommendation (subscription, one-time, usage-based, etc.)
            - Pricing tier structure (if applicable)
            - Rationale connecting price to WTP analysis and market signals
            
            **Target Segment:**
            - Primary target customer segment
            - Secondary segments (if applicable)
            - Segment prioritization rationale
            
            **Pricing Strategy:**
            - Penetration vs. skimming strategy recommendation
            - Discount strategy (if applicable)
            - Freemium vs. paid-only recommendation
            - Justification based on stage and market conditions
            
            ## 2. RISK ASSESSMENT
            
            **Confidence Score:**
            - Overall confidence in pricing recommendation (0-100%)
            - Breakdown by component (WTP confidence, market data quality, etc.)
            
            **Key Risks:**
            - Overpricing risks (what could go wrong if too high)
            - Underpricing risks (what could go wrong if too low)
            - Market risks (competitive response, market changes)
            - Execution risks (ability to communicate value, sales process)
            
            **Risk Mitigation:**
            - Strategies to reduce each identified risk
            - Early warning indicators to monitor
            
            ## 3. VALIDATION ROADMAP
            
            **Immediate Next Steps (Week 1-2):**
            - Specific, actionable validation experiments
            - Success metrics and thresholds
            - Resource requirements
            
            **Short-term Tests (Month 1-3):**
            - Pricing page A/B tests
            - Pre-order campaigns
            - Landing page price tests
            - Customer interview follow-ups
            
            **Long-term Validation (Quarter 1-2):**
            - Market testing approaches
            - Iteration strategy
            - Key metrics to track
            
            ## 4. IMPLEMENTATION GUIDANCE
            
            **Go-to-Market Considerations:**
            - Messaging recommendations for price communication
            - Sales enablement needs
            - Customer education requirements
            
            **Success Metrics:**
            - KPIs to track (conversion rate, ARPU, churn, etc.)
            - Target benchmarks
            - Review cadence
            
            ## OUTPUT FORMAT
            
            Create a polished, executive-ready markdown report that:
            - Starts with an executive summary
            - Uses clear sections and formatting
            - Includes specific numbers and recommendations
            - Provides actionable next steps
            - Is suitable for sharing with founders, investors, or pricing teams
            
            Make it comprehensive yet scannable. Use formatting (bold, italics, lists) 
            to make key information stand out.
            """
        ).strip(),
        expected_output=(
            "A comprehensive, executive-ready pricing strategy report in markdown format "
            "with specific recommendations, risk assessment, validation roadmap, and "
            "implementation guidance. The report should be actionable and evidence-based."
        ),
        agent=strategist,
        context_variables=["analysis_task_output", "product_type", "stage"],
    )

    # Build the crew
    crew = Crew(
        agents=[market_analyst, strategist],
        tasks=[analysis_task, strategy_task],
        process=Process.sequential,
        verbose=True,
        memory=True,  # Enable memory for better context retention
        max_rpm=10,  # Rate limiting
    )

    logger.info("✅ PriceLens crew configured successfully")
    return crew


def run_pricelens_pipeline(
    transcript_text: str,
    product_type: str = "SaaS",
    stage: str = "Pre-revenue"
) -> str:
    """
    Run the enhanced PriceLens AI pipeline.
    
    Args:
        transcript_text: Customer interview transcript to analyze
        product_type: Type of product (SaaS, E-commerce, B2B, etc.)
        stage: Business stage (Pre-revenue, Early-stage, Growth, etc.)
    
    Returns:
        str: Markdown-formatted analysis report
    
    Raises:
        ValueError: If transcript is too short or invalid
        Exception: If pipeline execution fails
    """
    # Validate input
    if not transcript_text or len(transcript_text.strip()) < 10:
        raise ValueError("Transcript must be at least 10 characters long")
    
    logger.info(f"🚀 Starting PriceLens pipeline")
    logger.info(f"   Product Type: {product_type}")
    logger.info(f"   Stage: {stage}")
    logger.info(f"   Transcript Length: {len(transcript_text)} characters")
    
    try:
        # Build and run the crew
        crew = build_pricelens_crew()
        
        inputs = {
            "transcript": transcript_text.strip(),
            "product_type": product_type,
            "stage": stage,
        }
        
        logger.info("🤖 Kicking off AI agents...")
        result = crew.kickoff(inputs=inputs)
        
        # Extract the result
        if hasattr(result, 'raw'):
            output = result.raw
        elif hasattr(result, 'content'):
            output = result.content
        else:
            output = str(result)
        
        logger.info("✅ Pipeline completed successfully")
        return output
        
    except Exception as e:
        logger.error(f"❌ Pipeline error: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    sample_transcript = """
    Interviewer: How much do you pay for pricing tools?
    Founder: We pay $50/month but it is too cheap for what we get. 
    We would pay $150/month if it integrated with our CRM. The current 
    solution doesn't solve our main pain point which is manual data entry.
    We spend 10 hours a week on this, and our time is worth at least $100/hour.
    """
    
    print("🚀 Running Enhanced PriceLens Pipeline...\n")
    print("=" * 60)
    
    try:
        output = run_pricelens_pipeline(
            sample_transcript,
            product_type="SaaS",
            stage="Pre-revenue"
        )
        
        print("\n" + "=" * 60)
        print("📊 FINAL OUTPUT")
        print("=" * 60 + "\n")
        print(output)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
