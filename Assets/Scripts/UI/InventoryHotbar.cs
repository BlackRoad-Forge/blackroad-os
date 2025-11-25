using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using BlackRoad.Worldbuilder.Items;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Renders a subset of the player's inventory as a hotbar UI.
    /// Use with a horizontal panel containing a SlotTemplate child.
    /// </summary>
    public class InventoryHotbar : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Inventory inventory;
        [SerializeField] private GameObject slotTemplate;
        [SerializeField] private int slotsToShow = 8;

        [Header("Selection")]
        [SerializeField] private Color selectedColor = Color.white;
        [SerializeField] private Color normalColor = new Color(1f, 1f, 1f, 0.6f);
        [SerializeField] private int selectedIndex = 0; // hotbar index, not full inventory index

        private readonly List<GameObject> _slotInstances = new List<GameObject>();

        private void Awake()
        {
            if (inventory == null)
            {
                // Try to find on player
                var player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                {
                    inventory = player.GetComponent<Inventory>();
                }
            }

            if (slotTemplate != null)
            {
                slotTemplate.SetActive(false); // hide template
            }

            BuildSlots();
        }

        private void OnEnable()
        {
            Refresh();
        }

        private void BuildSlots()
        {
            foreach (var go in _slotInstances)
            {
                if (go != null)
                {
                    Destroy(go);
                }
            }
            _slotInstances.Clear();

            if (slotTemplate == null)
            {
                return;
            }

            for (int i = 0; i < slotsToShow; i++)
            {
                var slotInstance = Instantiate(slotTemplate, slotTemplate.transform.parent);
                slotInstance.name = $"Slot_{i}";
                slotInstance.SetActive(true);
                _slotInstances.Add(slotInstance);
            }
        }

        private void Update()
        {
            HandleSelectionInput();
            Refresh();
        }

        private void HandleSelectionInput()
        {
            // 1..slotsToShow selects
            for (int i = 0; i < slotsToShow && i < 9; i++)
            {
                if (Input.GetKeyDown(KeyCode.Alpha1 + i))
                {
                    selectedIndex = i;
                }
            }
        }

        public void Refresh()
        {
            if (inventory == null || _slotInstances.Count == 0)
            {
                return;
            }

            var invSlots = inventory.Slots;

            for (int hotbarIndex = 0; hotbarIndex < _slotInstances.Count; hotbarIndex++)
            {
                GameObject slotObj = _slotInstances[hotbarIndex];
                if (slotObj == null)
                {
                    continue;
                }

                Image bg = slotObj.GetComponent<Image>();
                if (bg != null)
                {
                    bg.color = hotbarIndex == selectedIndex ? selectedColor : normalColor;
                }

                int invIndex = hotbarIndex;

                ItemDefinition item = null;
                int count = 0;

                if (invIndex >= 0 && invIndex < invSlots.Count)
                {
                    var slot = invSlots[invIndex];
                    item = slot.item;
                    count = slot.count;
                }

                Image iconImage = null;
                Text countText = null;

                foreach (Transform child in slotObj.transform)
                {
                    if (child.name.ToLower().Contains("icon"))
                    {
                        iconImage = child.GetComponent<Image>();
                    }

                    if (child.name.ToLower().Contains("count"))
                    {
                        countText = child.GetComponent<Text>();
                    }
                }

                if (iconImage != null)
                {
                    if (item != null && item.Icon != null)
                    {
                        iconImage.enabled = true;
                        iconImage.sprite = item.Icon;
                        iconImage.color = item.IconTint;
                    }
                    else
                    {
                        iconImage.enabled = false;
                    }
                }

                if (countText != null)
                {
                    if (item != null && count > 0)
                    {
                        countText.text = count.ToString();
                    }
                    else
                    {
                        countText.text = string.Empty;
                    }
                }
            }
        }

        /// <summary>
        /// Returns the currently selected ItemDefinition, if any.
        /// </summary>
        public ItemDefinition GetSelectedItem()
        {
            if (inventory == null)
            {
                return null;
            }

            var slots = inventory.Slots;
            if (selectedIndex < 0 || selectedIndex >= slots.Count)
            {
                return null;
            }

            var slot = slots[selectedIndex];
            return slot.item;
        }

        /// <summary>
        /// Returns current hotbar selection index (0-based).
        /// </summary>
        public int GetSelectedIndex() => selectedIndex;
    }
}
