using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.UI;

public class Web3Check : MonoBehaviour
{
    [SerializeField] private Text text;
    
    [DllImport("__Internal")]
    private static extern string WalletCheck();

    public void GetWallet()
    {
        text.text = WalletCheck();
    }
}
