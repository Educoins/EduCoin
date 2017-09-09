#include "transactiondesc.h"

#include "guiutil.h"
#include "bitcoinunits.h"

#include "../main.h"
#include "../wallet.h"
#include "../txdb.h"
#include "../ui_interface.h"
#include "../base58.h"

QString TransactionDesc::FormatTxStatus(const CWalletTx& wtx)
{
    AssertLockHeld(cs_main);
    if (!wtx.IsFinal())
    {
        if (wtx.nLockTime < LOCKTIME_THRESHOLD)
            return tr("Open for %n block(s)", "", nBestHeight - wtx.nLockTime);
        else
            return tr("Open until %1").arg(GUIUtil::dateTimeStr(wtx.nLockTime));
    } else
    {
        int nDepth = wtx.GetDepthInMainChain();
        if (nDepth < 0)
            return tr("conflicted");
        else if (GetAdjustedTime() - wtx.nTimeReceived > 2 * 60 && wtx.GetRequestCount() == 0)
            return tr("%1/offline").arg(nDepth);
        else if (nDepth < 10)
            return tr("%1/unconfirmed").arg(nDepth);
        else
            return tr("%1 confirmations").arg(nDepth);
    };
}

QString TransactionDesc::toHTML(CWallet *wallet, CWalletTx &wtx)
{
    QString strHTML;
    QString explorer(fTestNet ? "http://testnet.cryptoguru.tk/" : "http://cryptoguru.tk/"); //testnet explorer needed

    LOCK2(cs_main, wallet->cs_wallet);
    strHTML.reserve(4000);
    strHTML += "<html><font face='verdana, arial, helvetica, sans-serif'>";

    int64_t nTime = wtx.GetTxTime();
    int64_t nCredit = wtx.GetCredit();
    int64_t nDebit = wtx.GetDebit();
    int64_t nNet = nCredit - nDebit;

    strHTML += "<b>" + tr("Status") + ":</b> " + FormatTxStatus(wtx);
    int nRequests = wtx.GetRequestCount();
    if (nRequests != -1)
    {
        if (nRequests == 0)
            strHTML += tr(", has not been successfully broadcast yet");
        else if (nRequests > 0)
            strHTML += tr(", broadcast through %n node(s)", "", nRequests);
    };

    strHTML += "<br><br>";

    strHTML += "<b>" + tr("Date") + ":</b> " + (nTime ? GUIUtil::dateTimeStr(nTime) : "");

    strHTML += "<br><br>";

    //
    // From
    //
    if (wtx.IsCoinBase() || wtx.IsCoinStake())
    {
        strHTML += "<b>" + tr("Source") + ":</b> " + tr("Generated");
    } else
    if (wtx.mapValue.count("from") && !wtx.mapValue["from"].empty())
    {
        // Online transaction
        strHTML += "<b>" + tr("From") + ":</b> " + GUIUtil::HtmlEscape(wtx.mapValue["from"]);
    } else
    {
        // Offline transaction
        if (nNet > 0)
        {
            // Credit
            BOOST_FOREACH(const CTxOut& txout, wtx.vout)
            {
                if (wtx.nVersion == ANON_TXN_VERSION
                    && txout.IsAnonOutput())
                {
                    const CScript &s = txout.scriptPubKey;
                    CKeyID ckidD = CPubKey(&s[2+1], 33).GetID();
                    std::string sAnonPrefix("ao ");
                    if (wallet->HaveKey(ckidD) && (wallet->mapAddressBook[ckidD].empty() || !wallet->mapAddressBook[ckidD].compare(0, sAnonPrefix.length(), sAnonPrefix) == 0))
                    {
                        strHTML += "<b>" + tr("From") + ":</b> " + tr("unknown");
                        strHTML += "<br><br>";
                        strHTML += "<b>" + tr("To") + ":</b> <a href='"+explorer+"/Address/index.php?Currency=EDU&Address=";
                        strHTML += GUIUtil::HtmlEscape(CBitcoinAddress(ckidD).ToString())+"' target='_blank'>";
                        strHTML += GUIUtil::HtmlEscape(CBitcoinAddress(ckidD).ToString());
                        if (!wallet->mapAddressBook[ckidD].empty())
                            strHTML += " (" + tr("own address") + ", " + tr("label") + ": " + GUIUtil::HtmlEscape(wallet->mapAddressBook[ckidD]) + ")";
                        else
                            strHTML += " (" + tr("own address") + ")";
                        strHTML += "</a>";
                        strHTML += "<br><br>";
                    };
                    continue;
                }

                if (wallet->IsMine(txout))
                {
                    CTxDestination address;
                    if (ExtractDestination(txout.scriptPubKey, address) && IsDestMine(*wallet, address))
                    {
                        if (wallet->mapAddressBook.count(address))
                        {
                            strHTML += "<b>" + tr("From") + ":</b> " + tr("unknown");
                            strHTML += "<br><br>";
                            strHTML += "<b>" + tr("To") + ":</b> <a href='"+explorer+"/Address/index.php?Currency=EDU&Address=";
                            strHTML += GUIUtil::HtmlEscape(CBitcoinAddress(address).ToString())+"' target='_blank'>";
                            strHTML += GUIUtil::HtmlEscape(CBitcoinAddress(address).ToString());
                            if (!wallet->mapAddressBook[address].empty())
                                strHTML += " (" + tr("own address") + ", " + tr("label") + ": " + GUIUtil::HtmlEscape(wallet->mapAddressBook[address]) + ")";
                            else
                                strHTML += " (" + tr("own address") + ")";
                            strHTML += "</a>";
                            strHTML += "<br><br>";
                        };
                    };
                    break;
                };
            };
        };
    };

    strHTML += "<br><br>";

    //
    // To
    //
    if (wtx.mapValue.count("to") && !wtx.mapValue["to"].empty())
    {
        strHTML += "<br><br>";
        // Online transaction
        std::string strAddress = wtx.mapValue["to"];
        strHTML += "<b>" + tr("To") + ":</b> <a href='"+explorer + "/Address/index.php?Currency=EDU&Address=" + GUIUtil::HtmlEscape(strAddress) + "' target='_blank'>";
        CTxDestination dest = CBitcoinAddress(strAddress).Get();
        if (wallet->mapAddressBook.count(dest) && !wallet->mapAddressBook[dest].empty())
            strHTML += GUIUtil::HtmlEscape(wallet->mapAddressBook[dest]) + " ";
        strHTML += GUIUtil::HtmlEscape(strAddress) + "</a>";
        strHTML += "<br><br>";
    };

    //
    // Amount
    //
    if (wtx.IsCoinBase() && nCredit == 0)
    {
        //
        // Coinbase
        //
        int64_t nUnmatured = 0;
        BOOST_FOREACH(const CTxOut& txout, wtx.vout)
            nUnmatured += wallet->GetCredit(txout);
        strHTML += "<b>" + tr("Credit") + ":</b> ";
        if (wtx.IsInMainChain())
            strHTML += BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, nUnmatured)+ " (" + tr("matures in %n more block(s)", "", wtx.GetBlocksToMaturity()) + ")";
        else
            strHTML += "(" + tr("not accepted") + ")";
        strHTML += "<br><br>";
    } else
    if (nNet > 0)
    {
        //
        // Credit
        //
        strHTML += "<b>" + tr("Credit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, nNet);
        strHTML += "<br><br>";
    } else
    {
        bool fAllFromMe = true;
        BOOST_FOREACH(const CTxIn& txin, wtx.vin)
            fAllFromMe = fAllFromMe && wallet->IsMine(txin);

        bool fAllToMe = true;
        BOOST_FOREACH(const CTxOut& txout, wtx.vout)
            fAllToMe = fAllToMe && wallet->IsMine(txout);

        if (fAllFromMe)
        {
            //
            // Debit
            //
            BOOST_FOREACH(const CTxOut& txout, wtx.vout)
            {
                if (wallet->IsMine(txout))
                    continue;

                if (!wtx.mapValue.count("to") || wtx.mapValue["to"].empty())
                {
                    // Offline transaction
                    CTxDestination address;
                    if (ExtractDestination(txout.scriptPubKey, address))
                    {
                        strHTML += "<b>" + tr("To") + ":</b> <a href='"+explorer+"/Address/index.php?Currency=EDU&Address="+GUIUtil::HtmlEscape(CBitcoinAddress(address).ToString())+"' target='_blank'>";
                        if (wallet->mapAddressBook.count(address) && !wallet->mapAddressBook[address].empty())
                            strHTML += GUIUtil::HtmlEscape(wallet->mapAddressBook[address]) + " ";
                        strHTML += GUIUtil::HtmlEscape(CBitcoinAddress(address).ToString());
                        strHTML += "</a>";
                        strHTML += "<br><br>";
                    };
                };

                strHTML += "<b>" + tr("Debit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, -txout.nValue);
                strHTML += "<br><br>";
            }

            if (fAllToMe)
            {
                // Payment to self
                int64_t nChange = wtx.GetChange();
                int64_t nValue = nCredit - nChange;
                strHTML += "<b>" + tr("Debit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, -nValue);
                strHTML += "<br><br>";
                strHTML += "<b>" + tr("Credit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, nValue);
                strHTML += "<br><br>";
            }

            int64_t nTxFee = nDebit - wtx.GetValueOut();
            if (nTxFee > 0)
                strHTML += "<b>" + tr("Transaction fee") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, -nTxFee);
                strHTML += "<br><br>";
        } else
        {
            //
            // Mixed debit transaction
            //
            BOOST_FOREACH(const CTxIn& txin, wtx.vin)
            {

                if (wallet->IsMine(txin))
                    strHTML += "<b>" + tr("Debit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, -wallet->GetDebit(txin)) + "<br><br>";
            };

            BOOST_FOREACH(const CTxOut& txout, wtx.vout)
                if (wallet->IsMine(txout))
                    strHTML += "<b>" + tr("Credit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, wallet->GetCredit(txout)) + "<br><br>";
        }
    }

    strHTML += "<b>" + tr("Net amount") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, nNet, true) + "<br><br>";

    //
    // Message
    //
    if (wtx.mapValue.count("message") && !wtx.mapValue["message"].empty())
        strHTML += "<br><b>" + tr("Message") + ":</b><br>" + GUIUtil::HtmlEscape(wtx.mapValue["message"], true) + "<br><br>";
    if (wtx.mapValue.count("comment") && !wtx.mapValue["comment"].empty())
        strHTML += "<br><b>" + tr("Comment") + ":</b><br>" + GUIUtil::HtmlEscape(wtx.mapValue["comment"], true) + "<br><br>";

    char cbuf[256];
    for (uint32_t k = 0; k < wtx.vout.size(); ++k)
    {
        snprintf(cbuf, sizeof(cbuf), "n_%d", k);
        if (wtx.mapValue.count(cbuf) && !wtx.mapValue[cbuf].empty())
        strHTML += "<br><b>" + tr(cbuf) + ":</b> " + GUIUtil::HtmlEscape(wtx.mapValue[cbuf], true) + "<br><br>";
    }

    QString txid(wtx.GetHash().ToString().c_str());

    strHTML += "<b>" + tr("Transaction ID") + ":</b> <a href='"+explorer+"/Transaction/index.php?Currency=EDU&Transaction=" + txid + "' target='_blank'>" + txid + "</a><br>";

    if (wtx.IsCoinBase() || wtx.IsCoinStake())
        strHTML += "<br>" + tr("Generated coins must mature 50 blocks before they can be spent. When you generated this block, it was broadcast to the network to be added to the block chain. If it fails to get into the chain, its state will change to \"not accepted\" and it won't be spendable. This may occasionally happen if another node generates a block within a few seconds of yours.") + "<br><br>";

    //
    // Debug view
    //
    if (fDebug)
    {
        strHTML += "<hr><br>" + tr("Debug information") + "<br><br>";
        BOOST_FOREACH(const CTxIn& txin, wtx.vin)
            if(wallet->IsMine(txin))
                strHTML += "<b>" + tr("Debit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, -wallet->GetDebit(txin)) + "<br><br>";
        BOOST_FOREACH(const CTxOut& txout, wtx.vout)
            if(wallet->IsMine(txout))
                strHTML += "<b>" + tr("Credit") + ":</b> " + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, wallet->GetCredit(txout)) + "<br><br>";

        strHTML += "<br><b>" + tr("Transaction") + ":</b><br>";
        strHTML += GUIUtil::HtmlEscape(wtx.ToString(), true);

        CTxDB txdb("r"); // To fetch source txouts

        strHTML += "<br><b>" + tr("Inputs") + ":</b>";
        strHTML += "<ul>";

        BOOST_FOREACH(const CTxIn& txin, wtx.vin)
        {
            COutPoint prevout = txin.prevout;

            if (wtx.nVersion == ANON_TXN_VERSION
                && txin.IsAnonInput())
            {
                std::vector<uint8_t> vchImage;
                txin.ExtractKeyImage(vchImage);
                int nRingSize = txin.ExtractRingSize();

                std::string sCoinValue;
                CKeyImageSpent ski;
                bool fInMemPool;
                if (GetKeyImage(&txdb, vchImage, ski, fInMemPool))
                {
                    sCoinValue = strprintf("%f", (double)ski.nValue / (double)COIN);
                } else
                {
                    sCoinValue = "spend not in chain!";
                };

                strHTML += "<li>Anon Coin - value: "+GUIUtil::HtmlEscape(sCoinValue)+", ring size: "+GUIUtil::HtmlEscape(itostr(nRingSize))+", keyimage: "+GUIUtil::HtmlEscape(HexStr(vchImage))+"</li>";
                continue;
            };

            CTransaction prev;
            if (txdb.ReadDiskTx(prevout.hash, prev))
            {
                if (prevout.n < prev.vout.size())
                {
                    strHTML += "<li>";
                    const CTxOut &vout = prev.vout[prevout.n];
                    CTxDestination address;
                    if (ExtractDestination(vout.scriptPubKey, address))
                    {
                        strHTML +="<a href='"+explorer+"/Address/index.php?Currency=EDU&Address="+QString::fromStdString(CBitcoinAddress(address).ToString())+"' target='_blank'>";
                        if (wallet->mapAddressBook.count(address) && !wallet->mapAddressBook[address].empty())
                            strHTML += GUIUtil::HtmlEscape(wallet->mapAddressBook[address]) + " ";
                        strHTML += QString::fromStdString(CBitcoinAddress(address).ToString()) + "</a>";
                    }
                    strHTML = strHTML + " " + tr("Amount") + "=" + BitcoinUnits::formatWithUnit(BitcoinUnits::EDU, vout.nValue);
                    strHTML = strHTML + " IsMine=" + (wallet->IsMine(vout) ? tr("true") : tr("false")) + "</li>";
                }
            }
        }

        strHTML += "</ul>";
    }

    strHTML += "</font></html>";
    return strHTML;
}
