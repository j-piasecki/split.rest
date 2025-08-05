package rest.split.materialcolors

import android.os.Build
import android.os.Build.VERSION_CODES
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MaterialColorsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MaterialColors")

    Constants {
      mapOf("supported" to deviceSupportsMaterialYou())
    }

    Function("getMaterialColors") {
      if (deviceSupportsMaterialYou() && appContext.reactContext != null) {
        getPalette()
      } else {
        null
      }
    }
  }

  private fun deviceSupportsMaterialYou(): Boolean {
    return Build.VERSION.SDK_INT >= VERSION_CODES.S
  }

  @RequiresApi(VERSION_CODES.S)
  private fun getPalette(): Map<String, List<String>> {
    val systemAccent1 = arrayOf(
      android.R.color.system_accent1_0,
      android.R.color.system_accent1_10,
      android.R.color.system_accent1_50,
      android.R.color.system_accent1_100,
      android.R.color.system_accent1_200,
      android.R.color.system_accent1_300,
      android.R.color.system_accent1_400,
      android.R.color.system_accent1_500,
      android.R.color.system_accent1_600,
      android.R.color.system_accent1_700,
      android.R.color.system_accent1_800,
      android.R.color.system_accent1_900,
      android.R.color.system_accent1_1000
    ).map { colorToHex(it) }

    val systemAccent2 = arrayOf(
      android.R.color.system_accent2_0,
      android.R.color.system_accent2_10,
      android.R.color.system_accent2_50,
      android.R.color.system_accent2_100,
      android.R.color.system_accent2_200,
      android.R.color.system_accent2_300,
      android.R.color.system_accent2_400,
      android.R.color.system_accent2_500,
      android.R.color.system_accent2_600,
      android.R.color.system_accent2_700,
      android.R.color.system_accent2_800,
      android.R.color.system_accent2_900,
      android.R.color.system_accent2_1000
    ).map { colorToHex(it) }

    val systemAccent3 = arrayOf(
      android.R.color.system_accent3_0,
      android.R.color.system_accent3_10,
      android.R.color.system_accent3_50,
      android.R.color.system_accent3_100,
      android.R.color.system_accent3_200,
      android.R.color.system_accent3_300,
      android.R.color.system_accent3_400,
      android.R.color.system_accent3_500,
      android.R.color.system_accent3_600,
      android.R.color.system_accent3_700,
      android.R.color.system_accent3_800,
      android.R.color.system_accent3_900,
      android.R.color.system_accent3_1000
    ).map { colorToHex(it) }

    val systemNeutral1 = arrayOf(
      android.R.color.system_neutral1_0,
      android.R.color.system_neutral1_10,
      android.R.color.system_neutral1_50,
      android.R.color.system_neutral1_100,
      android.R.color.system_neutral1_200,
      android.R.color.system_neutral1_300,
      android.R.color.system_neutral1_400,
      android.R.color.system_neutral1_500,
      android.R.color.system_neutral1_600,
      android.R.color.system_neutral1_700,
      android.R.color.system_neutral1_800,
      android.R.color.system_neutral1_900,
      android.R.color.system_neutral1_1000
    ).map { colorToHex(it) }

    val systemNeutral2 = arrayOf(
      android.R.color.system_neutral2_0,
      android.R.color.system_neutral2_10,
      android.R.color.system_neutral2_50,
      android.R.color.system_neutral2_100,
      android.R.color.system_neutral2_200,
      android.R.color.system_neutral2_300,
      android.R.color.system_neutral2_400,
      android.R.color.system_neutral2_500,
      android.R.color.system_neutral2_600,
      android.R.color.system_neutral2_700,
      android.R.color.system_neutral2_800,
      android.R.color.system_neutral2_900,
      android.R.color.system_neutral2_1000
    ).map { colorToHex(it) }
    
    return mapOf(
      "systemAccent1" to systemAccent1,
      "systemAccent2" to systemAccent2,
      "systemAccent3" to systemAccent3,
      "systemNeutral1" to systemNeutral1,
      "systemNeutral2" to systemNeutral2,
    )
  }

  private fun getColor(id: Int) = with(appContext.reactContext!!) { resources.getColor(id, theme) }

  private fun colorToHex(color: Int) = String.format("#%06X", 0xFFFFFF and getColor(color))
}
