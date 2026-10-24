# -*- coding: utf-8 -*-
"""The planner directory's data, and the shape the backend has to return.

One module because two things read it: tools/build_pages.py writes the cards on
marketplace.html, and tools/build_planners.py writes assets/planners.js and the
profile page those cards link to. Keeping the list in one place is what stops a
card saying one thing and the profile behind it saying another.

Everything here is invented, and the pages say so in three places: on the
directory, on every profile, and inside the booking flow.

The twenty four rows are written out by hand. The detail hanging off each one
(the portfolio, the past events, the reviews, the consultation terms) is
composed from pools rather than authored twenty four times, because it is
placeholder for a backend response, not copy anyone will keep. The composition
is deterministic: the same planner always gets the same portfolio, so a
screenshot taken today still matches the page next week.

The shape profiles() returns is the shape /public/planners/{slug} should
return. Nothing else in the site reaches past it.
"""
import re

N = u"₦"
BANDS = {1: "Under " + N + "2m", 2: N + "2m to " + N + "5m",
         3: N + "5m to " + N + "15m", 4: N + "15m and above"}
TINTS = ["t-blush", "t-lilac", "t-mint", "t-blue", "t-cream", "t-grey"]

# One brand colour per planner, the way the app lets a planner set one on their
# consultation page. All six are dark enough to carry white text, because the
# profile page paints the cover and the badge with it.
BRANDS = ["#8a2f5f", "#4a42c7", "#17795a", "#1f5fae", "#9a6212", "#3c4457"]

#          name                  area              city          headline spec
#          type keys                      band rating events team  books up
#          what they take on
#          one line about them
PLANNERS = [
    ("Adaeze Mbakwe", "Lekki", "Lagos", "Weddings and private dining",
     "weddings private", 3, 4.9, 64, 6, "4 to 6 months ahead",
     "Full service planning, Day-of coordination, Traditional weddings, Supplier management",
     "Full service planning on a fixed project fee, with her own supplier panel and a coordinator on the floor all day."),
    ("Tobi Adeyinka", "Victoria Island", "Lagos", "Corporate events and launches",
     "corporate launches conferences", 4, 4.8, 91, 12, "3 months ahead",
     "Conferences, AGMs, Product launches, Guest movement, Production",
     "Runs production and guest movement in house, which is why the schedule on the day tends to hold."),
    ("Nkechi Obiora", "Wuse", "Abuja", "Weddings and private dining",
     "weddings private", 2, 4.9, 48, 4, "2 to 3 months ahead",
     "White weddings, Traditional weddings, Intimate dinners, Budget rescue",
     "Known for keeping a tight budget honest and saying early when a number will not work."),
    ("Ifeanyi Okonkwo", "GRA", "Port Harcourt", "Corporate events",
     "corporate conferences", 3, 4.7, 57, 8, "6 to 8 weeks ahead",
     "Corporate dinners, Award nights, Conferences, Staff events",
     "Oil and gas corporate work mostly, so he plans around security briefings and late sign off as standard."),
    ("Zainab Bello", "Maitama", "Abuja", "Luxury weddings",
     "weddings", 4, 5.0, 38, 9, "8 to 12 months ahead",
     "Destination weddings, Multi day celebrations, Guest logistics, Styling direction",
     "Takes a small number of events a year and gives each one a dedicated team from brief to the last guest."),
    ("Chidinma Eze", "Ikeja", "Lagos", "Birthdays and private dining",
     "birthdays private", 1, 4.6, 72, 3, "3 to 4 weeks ahead",
     "Milestone birthdays, Anniversaries, Supper clubs, Baby showers",
     "High volume and quick to turn around, which suits an event somebody decided on last month."),
    ("Emeka Nwachukwu", "Independence Layout", "Enugu", "Traditional weddings",
     "weddings", 2, 4.8, 44, 5, "3 months ahead",
     "Igbo traditional rites, Wine carrying, Family liaison, Multi venue days",
     "Grew up doing this work with family and handles the parts of a traditional day that a checklist does not cover."),
    ("Funmilayo Adeleke", "Bodija", "Ibadan", "Weddings and birthdays",
     "weddings birthdays", 2, 4.7, 61, 4, "6 to 8 weeks ahead",
     "White weddings, Engagements, Milestone birthdays, Aso ebi coordination",
     "Works the Ibadan and Oyo circuit, with suppliers she has used for years and prices she can hold."),
    ("Hauwa Suleiman", "Nassarawa", "Kano", "Weddings",
     "weddings", 2, 4.6, 33, 4, "2 months ahead",
     "Northern weddings, Fatiha, Walima, Family hosting",
     "Plans around the rhythm of a northern wedding week rather than squeezing it into a single day."),
    ("Olumide Fashola", "Ikoyi", "Lagos", "Conferences and summits",
     "conferences corporate", 4, 4.9, 83, 14, "4 months ahead",
     "Conferences, Summits, Hybrid events, Sponsor management, Registration",
     "Built his team around registration and sponsor delivery, the two things that sink a conference quietly."),
    ("Blessing Udo", "Uyo", "Uyo", "Weddings and private dining",
     "weddings private", 1, 4.8, 29, 3, "4 to 6 weeks ahead",
     "White weddings, Traditional weddings, Family dinners, Church coordination",
     "Akwa Ibom and Cross River, with a supplier list that keeps a small budget looking like a larger one."),
    ("Segun Bakare", "Yaba", "Lagos", "Launches and brand events",
     "launches corporate", 3, 4.7, 55, 7, "6 weeks ahead",
     "Product launches, Pop ups, Press days, Brand activations",
     "Comes from brand side rather than events, so the room is built around what the photographs need to show."),
    ("Amara Chukwu", "Owerri", "Owerri", "Traditional weddings",
     "weddings", 1, 4.9, 41, 3, "6 weeks ahead",
     "Igba nkwu, Traditional rites, Family liaison, Village logistics",
     "Runs village ceremonies where the venue is a compound and nothing can be hired on the day."),
    ("Kelechi Agu", "Asokoro", "Abuja", "Corporate and conferences",
     "corporate conferences", 3, 4.6, 66, 9, "2 months ahead",
     "Government events, Conferences, Retreats, Protocol",
     "Handles protocol and the waiting that comes with public sector work without letting it derail the run sheet."),
    ("Temitope Oladele", "Lekki", "Lagos", "Weddings",
     "weddings", 3, 4.8, 52, 6, "5 months ahead",
     "White weddings, Traditional weddings, Destination, Styling direction",
     "Design led, and will turn down a brief where the budget and the look cannot be reconciled."),
    ("Grace Ekanem", "Trans Amadi", "Port Harcourt", "Birthdays and anniversaries",
     "birthdays private", 1, 4.5, 47, 2, "3 weeks ahead",
     "Milestone birthdays, Anniversaries, Surprise parties, Home events",
     "Small team, quick decisions, and comfortable running an event in somebody's house rather than a hall."),
    ("Yusuf Danladi", "Garki", "Abuja", "Conferences and summits",
     "conferences corporate", 4, 4.7, 74, 11, "4 months ahead",
     "Summits, Policy events, Delegations, Interpretation, Accreditation",
     "Does the kind of event where half the guests arrive by delegation and accreditation decides the morning."),
    ("Ngozi Anyanwu", "GRA", "Benin City", "Weddings and private dining",
     "weddings private", 2, 4.8, 36, 4, "2 months ahead",
     "White weddings, Traditional rites, Private dinners, Supplier sourcing",
     "Edo and Delta work, and keeps a short, tested supplier list rather than a long one."),
    ("Damilola Sanni", "Surulere", "Lagos", "Birthdays and launches",
     "birthdays launches", 1, 4.6, 58, 3, "3 weeks ahead",
     "Milestone birthdays, Pop ups, Listening parties, Brand activations",
     "Young crowd events, late finishes, and a crew used to turning a bare space around in an afternoon."),
    ("Chiamaka Nnadi", "Jabi", "Abuja", "Luxury weddings",
     "weddings", 4, 4.9, 45, 8, "9 months ahead",
     "Destination weddings, Multi day celebrations, Guest travel, Styling direction",
     "Takes a handful of weddings a year, usually across two or three days and more than one city."),
    ("Bukola Ogunleye", "Oluyole", "Ibadan", "Corporate events",
     "corporate", 2, 4.5, 39, 5, "6 weeks ahead",
     "Corporate dinners, Staff events, AGMs, Training days",
     "Corporate work in Oyo and the south west, costed line by line before anything is booked."),
    ("Uche Ibe", "New Haven", "Enugu", "Weddings and corporate",
     "weddings corporate", 2, 4.7, 50, 6, "2 months ahead",
     "White weddings, Traditional rites, Corporate dinners, Award nights",
     "Splits the year between wedding season and corporate season, so there is usually room in one of them."),
    ("Rukayat Lawal", "Ikoyi", "Lagos", "Private dining",
     "private", 3, 4.8, 43, 4, "4 weeks ahead",
     "Private dinners, Supper clubs, Chef collaborations, Wine evenings",
     "Builds the evening around the menu first, and works with chefs rather than catering companies."),
    ("Peter Etim", "Uyo", "Uyo", "Conferences",
     "conferences corporate", 2, 4.6, 31, 5, "6 weeks ahead",
     "Conferences, Church conventions, Training days, Registration",
     "Large room, long programme, many speakers. The kind of event that lives or dies on the run sheet."),
]

# ------------------------------------------------------------------ the pools

# How the team is put together, by budget band. A band 1 planner saying they
# field a producer and a guest desk would not survive one read.
SHAPE = {
    1: "Works hands on with a small crew she has used for years, which is what keeps the fee where it is and the decisions quick.",
    2: "A small permanent team, with freelance coordinators brought in for the week of the event rather than carried all year.",
    3: "A full planning team, a lead planner on every event and a coordinator on the floor from the first delivery to the last guest.",
    4: "A dedicated team per event: a producer, a floor lead, a guest services desk and a separate person on suppliers.",
}
SHAPE_M = dict(SHAPE)
SHAPE_M[1] = SHAPE_M[1].replace("she has", "they have").replace(" the fee", " the fee")

METHOD = [
    "Costs are built line by line before anything is booked, and the line you approve is the line you are invoiced.",
    "Every supplier is someone they have worked with before. New ones are tried on their own events first, never on yours.",
    "A run sheet goes out to everyone a week before, and nothing goes on it that has not been confirmed in writing.",
    "You get one point of contact for the whole job, so you are never explaining the same thing to three people.",
]

COVERS = {
    "weddings": ["Where the budget actually goes", "Venue options that are free on your date",
                 "An honest run of the day, hour by hour", "What has to be booked first"],
    "corporate": ["The programme and the run sheet", "Venue and production options",
                  "Guest movement, arrival and seating", "What the budget has to cover"],
    "conferences": ["The programme and the speaker list", "Registration and accreditation",
                    "Venue, stage and production", "Sponsor delivery and what it is worth"],
    "private": ["The menu, and who is cooking it", "The room, the table and the pacing",
                "Drinks, and what they will cost", "What the evening comes to"],
    "launches": ["The look, and what the photographs need", "Venue, sound and lighting",
                 "The running order on the night", "What the budget has to cover"],
    "birthdays": ["The look and the crowd", "Venue, sound and catering",
                  "The running order", "What it will realistically cost"],
}

SAYS = [
    ("Our date was eleven weeks away and two suppliers had already fallen through. "
     "She rebuilt the whole thing in a fortnight and never once made it sound like a crisis.", "Ifeoma A."),
    ("What I did not expect was the budget. Every naira was against a line, and the final "
     "invoice was the number we agreed in month one.", "Tunde O."),
    ("They ran the day so quietly that my mother asked me afterwards who had been in charge.", "Ngozi U."),
    ("We have used four planners in six years. This is the first one who told us something "
     "was a bad idea before we spent money on it.", "Chike N."),
    ("The run sheet went out eight days before and everything on it happened at the minute "
     "it said. I have never seen that at a Nigerian wedding.", "Bisi A."),
    ("Three hundred guests, two venues, one afternoon. Not one person missed a bus.", "Adaora E."),
    ("I sent a brief at eleven at night and had a priced response, with options, by the "
     "following afternoon.", "Hassan M."),
    ("They pushed back on our venue, we ignored them, and they were right. The second time "
     "we listened.", "Yemi F."),
    ("Our CEO's only note afterwards was that it felt expensive and it was not.", "Uche K."),
    ("The part I would pay for again is the week before. Everything was already decided, so "
     "the day itself was just a nice day.", "Amaka I."),
    ("They handled a family disagreement about the seating with more grace than any of us "
     "managed.", "Olu B."),
    ("Small team, no fuss, and the only person still working at midnight was theirs.", "Kemi S."),
]

# What a review is attached to. A rating that is not tied to a completed
# booking is the thing the FAQ says cannot happen, so each one names an event.
SAYS_FOR = ["a wedding", "a corporate dinner", "a traditional wedding", "a conference",
            "a 50th birthday", "a product launch", "a private dinner", "an AGM"]

SURNAMES = ["Adeyemi", "Okafor", "Balogun", "Nwosu", "Eze", "Bello", "Danjuma", "Ogunleye",
            "Chukwu", "Etim", "Lawal", "Agu", "Udo", "Anyanwu", "Suleiman", "Oladele",
            "Fashola", "Bakare", "Ibe", "Nnadi", "Ekanem", "Sanni", "Obiora", "Mbakwe"]
FIRMS = ["Zenith", "Sterling", "Keystone", "Ardova", "Lumen", "Riverbank", "Northgate",
         "Clearwater", "Sable", "Harbourline", "Kestrel", "Meridian"]

PAST = {
    "weddings":    ["The %(sur)s wedding", "%(sur)s traditional rites", "The %(sur)s white wedding"],
    "corporate":   ["%(firm)s end of year", "%(firm)s partner dinner", "%(firm)s award night"],
    "conferences": ["%(firm)s annual summit", "%(firm)s leadership conference", "%(firm)s policy forum"],
    "private":     ["A %(sur)s anniversary dinner", "Supper club, %(area)s", "%(sur)s private dinner"],
    "launches":    ["%(firm)s product launch", "%(firm)s press day", "%(firm)s pop up"],
    "birthdays":   ["%(sur)s at 50", "%(sur)s at 40", "%(sur)s at 60"],
}
WHEN = ["February 2026", "March 2026", "April 2026", "May 2026", "June 2026", "July 2026",
        "August 2026", "September 2026", "November 2025", "December 2025", "January 2026",
        "October 2025"]
HEADS = {1: [60, 90, 120, 150], 2: [150, 200, 250, 320],
         3: [300, 400, 500, 650], 4: [450, 600, 800, 1200]}
# A private dinner is not a wedding however big the planner is, so the headcount
# follows the event rather than the band. Without this the page offered a supper
# club for four hundred.
SMALL = {"private": [24, 40, 60, 90], "birthdays": [60, 90, 120, 180]}

# Which photographs suit which kind of work. The gallery is cut from the same
# originals as the hero, so a wedding planner never shows a conference floor.
SHOTS = {
    "weddings":    ["ev-banquet", "stage-reception", "ev-hall", "hero-decor", "stage-banquet",
                    "cat-decor", "ev-reception", "cat-venues", "stage-hall", "cat-photography"],
    "corporate":   ["stage-summit", "ev-summit", "cat-venues", "hero-venue", "stage-banquet",
                    "cat-photography", "ev-banquet"],
    "conferences": ["stage-summit", "ev-summit", "hero-venue", "cat-venues", "cat-photography",
                    "stage-banquet"],
    "private":     ["cat-catering", "ev-banquet", "hero-venue", "stage-banquet", "cat-decor",
                    "ev-hall"],
    "launches":    ["hero-entertainment", "cat-entertainment", "ev-reception", "stage-reception",
                    "cat-photography", "hero-venue"],
    "birthdays":   ["hero-entertainment", "cat-entertainment", "ev-reception", "cat-beauty",
                    "stage-hall", "cat-decor"],
}
SHOT_CAPS = ["Reception, %(area)s", "The room before the doors", "On the floor",
             "Styling detail", "The set, %(city)s", "Guests arriving", "Head table",
             "The stage, %(city)s", "Service begins", "Late in the evening"]

AREAS = {
    "Lagos": ["Lekki", "Victoria Island", "Ikoyi", "Ikeja", "Surulere", "Ajah", "Yaba"],
    "Abuja": ["Maitama", "Asokoro", "Wuse", "Garki", "Jabi", "Gwarinpa"],
    "Port Harcourt": ["GRA", "Trans Amadi", "Rumuokoro", "Woji"],
    "Ibadan": ["Bodija", "Oluyole", "Jericho", "Agodi"],
    "Enugu": ["Independence Layout", "New Haven", "GRA", "Trans Ekulu"],
    "Benin City": ["GRA", "Ugbowo", "Sapele Road"],
    "Owerri": ["New Owerri", "Ikenegbu", "Wetheral"],
    "Kano": ["Nassarawa", "Bompai", "Sabon Gari"],
    "Uyo": ["Ewet Housing", "Shelter Afrique", "Oron Road"],
}
NEAR = {"Lagos": ["Ogun"], "Abuja": ["Nasarawa", "Niger"], "Port Harcourt": ["Bayelsa", "Rivers"],
        "Ibadan": ["Osun", "Oyo"], "Enugu": ["Anambra", "Ebonyi"], "Benin City": ["Delta"],
        "Owerri": ["Abia", "Imo"], "Kano": ["Kaduna", "Jigawa"], "Uyo": ["Cross River", "Akwa Ibom"]}

# Some planners charge for a consultation and some do not, which the booking
# flow has to handle either way. The fee follows the band, with two deliberate
# exceptions so neither case is a rule: one band 4 planner gives the first call
# free, and one band 1 planner charges a small fee.
FEE = {1: 0, 2: 15000, 3: 25000, 4: 50000}
FEE_OVERRIDE = {"zainab-bello": 0, "chidinma-eze": 7500}
MINUTES = {1: 30, 2: 30, 3: 45, 4: 60}

RULES = [
    "The call is held for you. If you need to move it, twenty four hours notice is enough and there is no charge.",
    "Any figure given on the call is indicative until the venue has been seen and the suppliers have quoted.",
    "No date is held in the diary until a deposit has been received and confirmed.",
    "What you share stays between us. We do not photograph, post or name a client's event without written permission.",
]
RULE_PAID = ("The consultation fee is taken off your project fee if you go on to book us, "
             "and it is refunded in full if we cannot take your date.")

WELCOME = [
    ("Thank you for thinking of us. Before the call it helps to know roughly what you are "
     "planning, when, and what you are working to. None of it has to be final.",
     "We will come back within two working days with a time, and with anything we think you "
     "should decide before we speak."),
    ("The questions below are the ones we would ask you on a first call anyway. Answering "
     "them here means we can spend the call on your event instead of on admin.",
     "If you are not sure of an answer yet, say so. A rough number is more use to us than a "
     "blank."),
    ("We take a small number of events at a time, so the first call is as much us working out "
     "whether we are right for you as the other way round.",
     "Tell us what you have already decided and what is still open. Both are useful."),
]

NETS = ["Instagram", "Facebook", "LinkedIn", "TikTok"]


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _first_type(types):
    return types.split()[0]


def _pick(pool, i, n):
    """n items from pool, starting at i, wrapping. Deterministic on purpose."""
    return [pool[(i + k) % len(pool)] for k in range(n)]


def profiles():
    out = []
    for i, p in enumerate(PLANNERS):
        (name, area, city, spec, types, band, rating, events, team, lead, does, bio) = p
        slug = slugify(name)
        first = name.split()[0]
        last = name.split()[-1]
        kind = _first_type(types)
        kinds = types.split()
        areas = _pick(AREAS[city], i, min(4, len(AREAS[city])))
        if area not in areas:
            areas = [area] + areas[:-1]

        shots = SHOTS[kind]
        gallery = []
        for k in range(6):
            img = shots[(i * 2 + k) % len(shots)]
            cap = SHOT_CAPS[(i + k) % len(SHOT_CAPS)] % {"area": areas[k % len(areas)], "city": city}
            gallery.append({"img": img, "cap": cap,
                            "kind": "film" if k == 2 else "photo"})

        past = []
        for k in range(4):
            tkind = kinds[k % len(kinds)]
            tpl = PAST[tkind][(i + k) % len(PAST[tkind])]
            past.append({
                "title": tpl % {"sur": SURNAMES[(i * 3 + k) % len(SURNAMES)],
                                "firm": FIRMS[(i * 2 + k) % len(FIRMS)],
                                "area": areas[k % len(areas)]},
                "when": WHEN[(i + k * 3) % len(WHEN)],
                "where": areas[(i + k) % len(areas)] + ", " + city,
                "guests": SMALL.get(tkind, HEADS[band])[k % 4],
            })

        says = []
        for k in range(2):
            q, who = SAYS[(i * 2 + k) % len(SAYS)]
            says.append({"q": q, "who": who,
                         "for": SAYS_FOR[(i + k * 2) % len(SAYS_FOR)],
                         "stars": 5 if rating >= 4.8 or k == 0 else 4})

        fee = FEE_OVERRIDE.get(slug, FEE[band])
        rules = list(RULES)
        if fee:
            rules.append(RULE_PAID)

        socials = [("Instagram", "@" + (first + last).lower() + "events"),
                   ("Facebook", name + " Events")]
        if i % 2 == 0:
            socials.append(("LinkedIn", name))
        if i % 3 == 0:
            socials.append(("TikTok", "@" + first.lower() + "." + last.lower()))

        out.append({
            "slug": slug, "name": name, "initials": first[0] + last[0],
            "area": area, "city": city, "spec": spec, "types": types,
            "band": band, "rate": BANDS[band], "rating": rating, "events": events,
            "team": str(team) + " people", "lead": lead, "bio": bio,
            "does": [t.strip() for t in does.split(",")],
            "tint": TINTS[i % len(TINTS)], "brand": BRANDS[i % len(BRANDS)],
            "cover": gallery[0]["img"],
            "years": 4 + (i % 9),
            "reply": ["within a day", "within two days", "same day"][i % 3],
            "shape": SHAPE[band] if i % 2 == 0 else SHAPE_M[band],
            "method": METHOD[i % len(METHOD)],
            "areas": areas, "near": NEAR[city],
            "covers": COVERS[kind], "fee": fee, "minutes": MINUTES[band],
            "rules": rules, "welcome": WELCOME[i % len(WELCOME)],
            "socials": socials,
            "gallery": gallery, "past": past, "says": says,
        })
    return out


CITIES = sorted(set(p[2] for p in PLANNERS))
TYPE_OPTS = [("weddings", "Weddings"), ("corporate", "Corporate"), ("conferences", "Conferences"),
             ("private", "Private dining"), ("launches", "Launches"), ("birthdays", "Birthdays")]
