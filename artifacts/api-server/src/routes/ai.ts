import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, routesTable, routeLegsTable, areasTable } from "@workspace/db";

const router: IRouter = Router();

const LAGOS_ROUTE_KNOWLEDGE = `You are DanfoGPT, a Lagos danfo route expert who speaks naturally and helpfully.
You help people find danfo routes in Lagos, Nigeria.
You know Lagos well — areas like Yaba, Surulere, Mushin, Oshodi, Ikeja, Lekki, Victoria Island, CMS, Obalende, etc.
You speak in a friendly mix of English and occasional Lagos slang (e.g. "oga", "wahala", "abi", "sha").
Keep responses concise and practical. Always mention key landmarks, fares where known, and transfer points.
If you don't know a route, say so honestly and suggest the user contribute it.
Format directions as numbered steps.`;

type Message = { role: "user" | "assistant"; content: string };

async function getRoutesContext(): Promise<string> {
  try {
    const routes = await db.select().from(routesTable);
    if (routes.length === 0) return "No routes have been contributed yet.";

    const enriched = await Promise.all(
      routes.map(async (r) => {
        const [startArea] = await db
          .select({ name: areasTable.name })
          .from(areasTable)
          .where(eq(areasTable.id, r.start_area_id));
        const [endArea] = await db
          .select({ name: areasTable.name })
          .from(areasTable)
          .where(eq(areasTable.id, r.end_area_id));
        const legs = await db
          .select()
          .from(routeLegsTable)
          .where(eq(routeLegsTable.route_id, r.id))
          .orderBy(routeLegsTable.leg_order);
        return {
          start: startArea?.name ?? "Unknown",
          end: endArea?.name ?? "Unknown",
          buses: r.buses_required,
          legs,
        };
      })
    );

    return enriched
      .map(
        (r) =>
          `Route: ${r.start} → ${r.end} (${r.buses} bus${r.buses !== "1" ? "es" : ""})\n` +
          r.legs
            .map((l) => `  ${l.start_area}→${l.end_area} fare:${l.fare_range} time:${l.travel_time_range}`)
            .join("\n")
      )
      .join("\n\n");
  } catch {
    return "Route data unavailable.";
  }
}

function buildSimulatedResponse(
  message: string,
  routeContext: string
): { reply: string; route_found: boolean; suggestions: string[] } {
  const lower = message.toLowerCase();

  const areaNames = [
    "yaba", "surulere", "mushin", "oshodi", "ikeja", "maryland", "lekki",
    "victoria island", "vi", "cms", "obalende", "ikoyi", "gbagada", "ketu",
    "ojota", "berger", "agege", "iyana ipaja", "festac", "mile 2", "apapa",
    "ebute metta", "ajah", "sangotedo", "ikorodu", "anthony", "onipanu",
    "fadeyi", "unilag", "sabo", "orile", "badore", "ikotun", "egbeda",
  ];

  const mentioned = areaNames.filter((a) => lower.includes(a));

  if (lower.includes("hello") || lower.includes("hi") || lower.match(/^hey/)) {
    return {
      reply:
        "Ẹ káàbọ̀! Welcome to DanfoGPT — your Lagos danfo guide. Where you dey go? Tell me your starting point and destination and I go direct you sharp sharp.",
      route_found: false,
      suggestions: ["Yaba to Victoria Island", "Ikeja to Lekki", "Surulere to CMS", "Oshodi to Ajah"],
    };
  }

  if (lower.includes("contribute") || lower.includes("add route") || lower.includes("add a route")) {
    return {
      reply:
        "To contribute a route, go to the Contribute page from your dashboard. Enter your start area, end area, number of buses, and details for each leg. Every contribution earns you badges and helps the whole Lagos community!",
      route_found: false,
      suggestions: ["Yaba to Victoria Island", "Ikeja to Lekki"],
    };
  }

  if (lower.includes("fare") || lower.includes("cost") || lower.includes("how much")) {
    return {
      reply:
        "Lagos danfo fares dey change o — depends on distance and conductor mood! Generally:\n\n1. Short trips (under 20 mins): ₦200–₦300\n2. Medium trips (20–45 mins): ₦300–₦500\n3. Long trips (1hr+): ₦500–₦1000+\n\nIf you just completed a trip, submit a fare report and we go update our data. Which route you wan check?",
      route_found: false,
      suggestions: ["Yaba to CMS fare", "Oshodi to Ajah fare", "Ikeja to Lekki fare"],
    };
  }

  if (mentioned.length >= 2) {
    const from = mentioned[0];
    const to = mentioned[1];

    const knownRoutes: Record<string, { steps: string[]; fare: string; time: string }> = {
      "yaba-victoria island": {
        steps: [
          "Board any danfo at Yaba bus stop heading to CMS",
          "Drop at CMS or Obalende junction",
          "Take another danfo or BRT heading to Victoria Island",
          "Drop at your stop on VI",
        ],
        fare: "₦300–₦500 total",
        time: "45–90 minutes depending on traffic",
      },
      "yaba-vi": {
        steps: [
          "Board any danfo at Yaba heading to CMS",
          "Drop at CMS or Obalende junction",
          "Take another danfo or BRT to Victoria Island",
        ],
        fare: "₦300–₦500 total",
        time: "45–90 minutes",
      },
      "ikeja-lekki": {
        steps: [
          "From Ikeja, board danfo to Oshodi (very frequent)",
          "From Oshodi, take bus to CMS/Obalende",
          "From Obalende, take Lekki/Ajah danfo",
          "Tell conductor 'Lekki Phase 1'",
        ],
        fare: "₦500–₦800 total",
        time: "1.5–3 hours (this route get wahala for traffic o)",
      },
      "surulere-cms": {
        steps: [
          "From Surulere, board danfo to Ojuelegba",
          "At Ojuelegba, connect to CMS-bound danfo",
          "Drop at CMS",
        ],
        fare: "₦200–₦350",
        time: "30–60 minutes",
      },
      "oshodi-ajah": {
        steps: [
          "From Oshodi, take BRT or danfo to CMS/Obalende",
          "From Obalende, board Ajah/Sangotedo danfo",
          "Tell conductor your stop",
        ],
        fare: "₦450–₦700",
        time: "1.5–2.5 hours",
      },
      "yaba-cms": {
        steps: [
          "Board any danfo at Yaba bus stop heading to CMS",
          "Direct route — tell conductor CMS",
        ],
        fare: "₦150–₦250",
        time: "20–40 minutes",
      },
      "mushin-ikeja": {
        steps: [
          "From Mushin, board danfo heading to Oshodi",
          "From Oshodi, take danfo to Ikeja",
        ],
        fare: "₦200–₦350",
        time: "30–60 minutes",
      },
    };

    const key = `${from}-${to}`;
    const reverseKey = `${to}-${from}`;
    const route = knownRoutes[key] || knownRoutes[reverseKey];

    if (route) {
      const steps = route.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const fromLabel = from.charAt(0).toUpperCase() + from.slice(1);
      const toLabel = to.charAt(0).toUpperCase() + to.slice(1);
      return {
        reply: `Oya! Here is how to get from ${fromLabel} to ${toLabel}:\n\n${steps}\n\nFare: ${route.fare}\nTime: ${route.time}\n\nSafe journey sha! This route na community-verified.`,
        route_found: true,
        suggestions: [],
      };
    }

    if (routeContext && routeContext !== "No routes have been contributed yet." && routeContext !== "Route data unavailable.") {
      return {
        reply: `Let me check our community database for ${from} to ${to}...\n\nHere is what I found from contributors:\n\n${routeContext.slice(0, 500)}\n\nIf this no match exactly, try verifying the route yourself and contribute it — you go earn badges!`,
        route_found: true,
        suggestions: [],
      };
    }

    const fromLabel = from.charAt(0).toUpperCase() + from.slice(1);
    const toLabel = to.charAt(0).toUpperCase() + to.slice(1);
    return {
      reply: `I no get a confirmed route from ${fromLabel} to ${toLabel} in my database yet.\n\nGeneral advice: head to the nearest major junction (Oshodi, CMS, or Ojuelegba) and connect from there. Ask locals at the bus stop — they go point you right.\n\nIf you know this route, abeg contribute it on the Contribute page — you go help many Lagosians and earn a badge!`,
      route_found: false,
      suggestions: ["How do I contribute a route?", "What areas do you cover?"],
    };
  }

  if (lower.includes("what areas") || lower.includes("which areas") || lower.includes("areas do you")) {
    return {
      reply:
        "We cover all major Lagos areas including: Yaba, Surulere, Mushin, Oshodi, Ikeja, Maryland, Ketu, Ojota, Berger, Agege, Iyana Ipaja, Abule Egba, Ikotun, Egbeda, Akowonjo, Festac, Mile 2, Gbagada, CMS, Marina, Obalende, Victoria Island, Ikoyi, Lekki, Ajah, Sangotedo, Ikorodu, Apapa, Ebute Metta, and many more.\n\nOur community is growing — contribute a route and it will appear on our map!",
      route_found: false,
      suggestions: ["Yaba to Victoria Island", "Ikeja to Lekki"],
    };
  }

  return {
    reply:
      "I dey hear you! Tell me which area you dey and where you wan go — I go find the best danfo route for you.\n\nExample: 'How do I get from Yaba to Victoria Island?'",
    route_found: false,
    suggestions: ["Yaba to Victoria Island", "Ikeja to Lekki", "Surulere to CMS", "Oshodi to Ajah"],
  };
}

router.post("/danfogpt", async (req, res): Promise<void> => {
  const { message, conversation_history = [] } = req.body as {
    message: string;
    conversation_history: Message[];
  };

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const routeContext = await getRoutesContext();
  const QWEN_API_KEY = process.env.QWEN_API_KEY;
  const QWEN_BASE_URL =
    process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";

  if (QWEN_API_KEY) {
    try {
      const messages: Message[] = [
        {
          role: "user" as const,
          content: `${LAGOS_ROUTE_KNOWLEDGE}\n\nKnown community routes:\n${routeContext}`,
        },
        ...conversation_history,
        { role: "user" as const, content: message },
      ];

      const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          choices: { message: { content: string } }[];
        };
        const reply = data.choices?.[0]?.message?.content ?? "";
        res.json({
          reply,
          route_found: reply.includes("→") || /step\s*\d/i.test(reply),
          suggestions: [],
        });
        return;
      }
    } catch {
    }
  }

  const simulated = buildSimulatedResponse(message, routeContext);
  res.json(simulated);
});

export default router;
