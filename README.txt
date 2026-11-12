AYESHA & AWAIS WEDDING INVITATION  -  Jabeen Customs Digital
=====================================================================

1. WHAT IS IN THIS FOLDER (upload ALL of it)
---------------------------------------------------------------------
index.html                         The wedding website (all text, styles and code).
assets/                            MUST stay next to index.html. The website loads these files from here:
    couple.webp                    hero couple illustration
    couple-alt.webp                closing couple illustration
    logo.webp                      Jabeen Customs logo
    favicon.webp                   browser tab icon
    flowers/rose-corner.webp       rose corner artwork
    flowers/rose-white.webp        white rose artwork
    wedding-nasheed.mp3            background music (you must hold the rights to publish it)
    og-share.jpg                   WhatsApp / social link-preview image (1200x630)
    jabeen-customs-logo.png        spare copy of the original logo (not used by the page)
host/index.html                    PRIVATE host dashboard (open at  /host/ )
netlify/functions/create-invite.js backend: checks the bride's / groom's password and signs invitation links
netlify/functions/get-invite.js    backend: verifies a signed link for guests
netlify.toml                       tells Netlify where the functions are
check.html                         diagnostic page (open at /check.html) - shows what is missing
README.txt                         this file

IMPORTANT: index.html does NOT contain the pictures or the music. They are separate files in assets/.
If assets/ is missing on the website, the illustrations and music will not appear.
Never upload only index.html. Upload the complete folder.
(An older note saying the images and music are embedded inside index.html was wrong for this version.)

2. DEPLOY ON NETLIFY SO THE FUNCTIONS WORK
---------------------------------------------------------------------
Step A - set the secrets (never put them in any file). Netlify > your site > Site configuration > Environment variables > Add a variable:
    BRIDE_PASSWORD = password for the BRIDE's account (she can create Bride's Family links only)
    GROOM_PASSWORD = password for the GROOM's account (he can create Groom's Family links only)
    INVITE_SECRET  = a long random string, 40+ characters, used to sign links. Keep it private.
  Use different passwords for the two accounts. Do not change INVITE_SECRET later, or every link already shared stops working.
  An account whose password is not set cannot sign in (it never opens without a password).
Step B - deploy the WHOLE folder in a way that includes functions:
  - Recommended: connect the folder to a Git repository (GitHub) and link it to the existing Netlify site, or
  - use the Netlify CLI from inside this folder:   netlify deploy --prod
  Drag-and-drop deployment may publish the pages but NOT the functions. If so, the dashboard will say the
  secure link service is not available.
Step C - after deploying, open  https://YOUR-SITE.netlify.app/check.html . Every line should be green:
  all files found, get-invite running, create-invite running with BRIDE_PASSWORD and GROOM_PASSWORD set. If a line is red it tells you what is missing.
  (If you changed environment variables after deploying, redeploy once so the functions see them.)

3. HOW THE HOSTS CREATE AND SHARE LINKS
---------------------------------------------------------------------
  1. Open  https://YOUR-SITE.netlify.app/host/   (it is not linked anywhere on the guest website).
  2. Choose "Bride's account" or "Groom's account", enter that account's password and press Unlock.
     The bride's account can only create Bride's Family links; the groom's account only Groom's Family links.
  3. (No family choice is needed: it follows the account.)
     Bride's links cannot include Groom's Mehndi; Groom's links cannot include Bride's Mehndi.
  4. Tick the functions that group should see (one, two, three or all that are allowed).
  5. Optionally type a private label, e.g. "Bride Friends - Barat". Guests never see it.
  6. Press Generate Invitation Link. It appears in "Your links", e.g.  https://YOUR-SITE.netlify.app/?i=b5-3859603a7eaa
  7. Press Copy Link.   (Press Preview Invitation to open it exactly as a guest would.)
  8. Paste the link into WhatsApp and send it to everyone in that group.
One link can be sent to as many guests as you like. Make a new link only for a group that needs a different set of functions.
Remove deletes the link from your list only; the link itself still works.
"Show here" opens the complete invitation for that link inside the dashboard so you can see what guests will see.
Each account keeps its own list: the bride cannot see the groom's list and vice versa.

                HOST                                     GUEST
        +---------------------+                +---------------------------+
        |  /host/  + password |                |  taps the link on WhatsApp |
        |  family + functions |                +-------------+-------------+
        |  Generate -> Copy   |                              v
        +----------+----------+                +---------------------------+
                   |  sends link on WhatsApp   |  invitation website opens |
                   +-------------------------> |  ONLY that link's events  |
                                               |  (no side/event questions)|
                                               +-------------+-------------+
                                                             v
                                               +---------------------------+
                                               | name, number, attending,  |
                                               | optional dua -> Continue  |
                                               +-------------+-------------+
                                                             v
                                               WhatsApp opens to the CORRECT family's number
                                               (bride's link -> bride, groom's link -> groom).
                                               The guest presses Send.

4. WHAT A GUEST SEES
---------------------------------------------------------------------
  1. The guest taps the link and the invitation opens (tap the envelope; the music starts).
  2. Only the functions in that link appear: cards, dates, venues, map and calendar buttons. Others are removed.
  3. The guest is never asked for their side or functions. The RSVP shows "Your Invitation Includes" as read-only text.
  4. They enter their name and WhatsApp number, choose Yes/No, optionally write a dua, and press Continue to WhatsApp.
  5. WhatsApp opens with the message ready, addressed to the bride (bride's link) or the groom (groom's link).
     The message lists the functions that guest was invited to. The guest presses Send.
If a link has no Barat, the countdown, Save the Date and closing date follow that guest's first function.

5. TESTING A GUEST INVITATION
---------------------------------------------------------------------
  - In /host/, generate a link and press Preview Invitation, or paste the link into your phone's browser.
  - Check that only the chosen functions appear, then fill the RSVP and look at the WhatsApp message and recipient.
  - Send yourself a link on WhatsApp to see exactly what guests will receive.

6. STRICT MODE (turn on only after step 2C is all green)
---------------------------------------------------------------------
In index.html, find   invitation: { strictLinks: false }   and change it to   strictLinks: true , then redeploy.
  false (current): the plain website address still shows every function, as before.
  true : the plain address shows NO functions, and only valid signed links reveal events. A missing, invalid or
         unverifiable link shows a clear "please use your invitation link" message and the RSVP is locked.
Do this only after you have generated a link and confirmed it opens correctly on the live site.
Even in the current mode, a link that cannot be verified (forged, damaged, or the function is down) is never treated as a full invitation.

7. HONEST LIMITS
---------------------------------------------------------------------
  - Links are a way to personalise, not to verify guests: anyone given a link can forward it.
  - Signed links (?i=...) cannot be edited by guests. "Basic links" (?side=...&events=...) are only offered if the functions are
    not set up; guests can edit those in the address bar, so use signed links.
  - The list in "Your links" is saved in the browser you used on /host/ (localStorage), separately for each account. It is NOT a shared database and does NOT sync
    between phones or computers. Copy important links somewhere safe. A shared database would need extra setup (e.g. Netlify Blobs
    or an external database) which is not included.
  - Guests send their RSVP through their own WhatsApp, so the hosts should read the "Invited to" lines in each message.
  - Google Fonts need internet. WhatsApp caches link previews; add ?v=2 or re-scrape in the Facebook Sharing Debugger after changes.
    (The preview tags in index.html point to https://ayesha-awais-wedding-invitation.netlify.app/ - change them if your domain differs.)
  - Calendar buttons assume a 4-hour length per function (WEDDING_CONFIG.calendar.defaultDurationMinutes).
  - Mehndi map links (mapUrl) are still empty; the map button appears automatically once filled.

8. WHERE TO EDIT DETAILS
---------------------------------------------------------------------
Top of the <script> in index.html, in WEDDING_CONFIG: couple names, family lines, events (dates, venues, map links),
WhatsApp numbers (bride +32 465 66 77 69, groom +92 325 6866899), music title, assets paths.
