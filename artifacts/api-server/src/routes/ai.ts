import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, routesTable, routeLegsTable, areasTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const LAGOS_ROUTE_KNOWLEDGE = `You are DanfoGPT — a sharp Lagos danfo guide wey know every route, junction, and conductor trick for Lagos.

HOW YOU TALK:
- You speak natural Lagos pidgin mixed with plain English. Not too heavy, not too refined — like a smart friend wey dey explain things to you.
- Use words like: "oga", "sha", "abeg", "wahala", "abi", "na", "dey", "sabi", "oya", "just enter", "drop for", "tell conductor", "no dulling"
- Never sound like a customer service bot. Sound like someone wey actually take danfo everyday.
- Keep it short and direct. No long grammar. If the route get wahala (traffic, connection), mention am.
- Always give fares and rough time estimates where you know am.
- Format directions as numbered steps — clear and simple.
- If you no know a route, be honest. Tell them to head to the nearest big junction and ask, or contribute the route on the app.
- Never say "certainly", "absolutely", "of course", "I'd be happy to" — that kind talk no be danfo energy.`;

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
        "Oya welcome! I be DanfoGPT — your Lagos danfo guy. Where you wan go? Drop your starting point and destination, I go sort you out sharp sharp.",
      route_found: false,
      suggestions: ["Yaba to Victoria Island", "Ikeja to Lekki", "Surulere to CMS", "Oshodi to Ajah"],
    };
  }

  if (lower.includes("contribute") || lower.includes("add route") || lower.includes("add a route")) {
    return {
      reply:
        "You wan add route? Oya — go your dashboard, click Contribute. Put your start area, end area, how many buses e go take, and the details for each leg. We go add am to the map and you go collect badge. The community go thank you sha.",
      route_found: false,
      suggestions: ["Yaba to Victoria Island", "Ikeja to Lekki"],
    };
  }

  if (lower.includes("fare") || lower.includes("cost") || lower.includes("how much")) {
    return {
      reply:
        "Fares dey change o — conductor and traffic get their own mind. But rough rough:\n\n1. Short trip (under 20 mins): ₦200–₦300\n2. Medium trip (20–45 mins): ₦300–₦500\n3. Long trip (1hr+): ₦500–₦1000+\n\nIf you just finish a trip, submit fare report — e go help the next person. Which route you dey check?",
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
          "Enter danfo for Yaba bus stop — tell conductor CMS",
          "Drop for Obalende junction (not CMS — Obalende dey closer to VI)",
          "Cross over, enter VI-bound danfo or BRT",
          "Tell conductor your exact stop for VI",
        ],
        fare: "₦300–₦500 total",
        time: "45–90 mins — depends on Third Mainland wahala",
      },
      "yaba-vi": {
        steps: [
          "Enter danfo for Yaba — tell conductor CMS or Obalende",
          "Drop for Obalende junction",
          "Enter another danfo or BRT going to Victoria Island",
        ],
        fare: "₦300–₦500 total",
        time: "45–90 mins",
      },
      "ikeja-lekki": {
        steps: [
          "Enter danfo from Ikeja to Oshodi — buses dey always",
          "From Oshodi, enter bus going CMS or Obalende",
          "From Obalende, enter Lekki/Ajah danfo",
          "Tell conductor 'Lekki Phase 1' so e know where to drop you",
        ],
        fare: "₦500–₦800 total",
        time: "1.5–3 hours — this route get serious traffic, especially afternoon",
      },
      "surulere-cms": {
        steps: [
          "Enter danfo from Surulere going Ojuelegba",
          "Drop for Ojuelegba, enter CMS danfo from there",
          "Tell conductor CMS, drop when you reach",
        ],
        fare: "₦200–₦350",
        time: "30–60 mins",
      },
      "oshodi-ajah": {
        steps: [
          "From Oshodi, enter BRT or danfo going CMS/Obalende",
          "Drop for Obalende, then enter Ajah or Sangotedo danfo",
          "Tell conductor your stop before you enter — so no overshoot",
        ],
        fare: "₦450–₦700",
        time: "1.5–2.5 hours — island traffic no dey play",
      },
      "yaba-cms": {
        steps: [
          "Enter danfo for Yaba bus stop — just tell conductor CMS",
          "Direct route, no connection needed",
        ],
        fare: "₦150–₦250",
        time: "20–40 mins",
      },
      "mushin-ikeja": {
        steps: [
          "Enter danfo from Mushin going Oshodi",
          "From Oshodi, enter Ikeja danfo — very common route",
        ],
        fare: "₦200–₦350",
        time: "30–60 mins",
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
        reply: `Oya, ${fromLabel} to ${toLabel}:\n\n${steps}\n\nFare: ${route.fare}\nTime: ${route.time}\n\nSafe journey sha!`,
        route_found: true,
        suggestions: [],
      };
    }

    if (routeContext && routeContext !== "No routes have been contributed yet." && routeContext !== "Route data unavailable.") {
      return {
        reply: `Lemme check what the community get for ${from} to ${to}...\n\n${routeContext.slice(0, 500)}\n\nIf e no match exactly, abeg verify am and contribute the correct one — you go earn badge and help others.`,
        route_found: true,
        suggestions: [],
      };
    }

    const fromLabel = from.charAt(0).toUpperCase() + from.slice(1);
    const toLabel = to.charAt(0).toUpperCase() + to.slice(1);
    return {
      reply: `${fromLabel} to ${toLabel} — I no get that one confirmed yet.\n\nBest bet: head to the nearest big junction — Oshodi, CMS, or Ojuelegba. From there you go find connecting buses. Ask at the bus stop, Lagosians dey always know.\n\nIf you sabi this route yourself, abeg contribute am — you go earn badge and help the next person.`,
      route_found: false,
      suggestions: ["How do I contribute a route?", "What areas do you cover?"],
    };
  }

  if (lower.includes("what areas") || lower.includes("which areas") || lower.includes("areas do you")) {
    return {
      reply:
        "We cover plenty Lagos areas: Yaba, Surulere, Mushin, Oshodi, Ikeja, Maryland, Ketu, Ojota, Berger, Agege, Iyana Ipaja, Abule Egba, Ikotun, Egbeda, Festac, Mile 2, Gbagada, CMS, Obalende, Victoria Island, Ikoyi, Lekki, Ajah, Sangotedo, Ikorodu, Apapa, Ebute Metta, and more.\n\nWe still dey grow — contribute a route and e go show on the map straight.",
      route_found: false,
      suggestions: ["Yaba to Victoria Island", "Ikeja to Lekki"],
    };
  }

  return {
    reply:
      "Tell me where you dey and where you wan reach — I go find the danfo route for you.\n\nExample: 'How do I get from Yaba to Victoria Island?'",
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
  const QWEN_API_KEY = process.env.QWEN_API_KEY_DANFO;
  const QWEN_BASE_URL =
    process.env.QWEN_BASE_URL || "https://ws-kslei9o3pxdkd1zd.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1";

  if (QWEN_API_KEY) {
    try {
      const messages = [
        {
          role: "system" as const,
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
      } else {
        const errText = await response.text();
        logger.warn({ status: response.status, body: errText }, "Qwen API error — falling back to simulated");
      }
    } catch (err) {
      logger.warn({ err }, "Qwen fetch failed — falling back to simulated");
    }
  }

  const simulated = buildSimulatedResponse(message, routeContext);
  res.json(simulated);
});

export default router;
